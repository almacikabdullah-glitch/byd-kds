/**
 * BYD KDS - TOPSIS Controller
 * TOPSIS çalıştırma ve sonuç yönetimi
 */
const { query, transaction } = require('../../config/database');
const { cache, CACHE_KEYS, invalidatePattern } = require('../../config/cache');
const logger = require('../../config/logger');
const TopsisEngine = require('./engine');

// TOPSIS çalıştır
const runTopsis = async (req, res) => {
    try {
        const {
            runName,
            scenarioType = 'custom',
            weights,
            dateRangeStart,
            dateRangeEnd
        } = req.body;

        if (!runName) {
            return res.status(400).json({
                success: false,
                error: 'Çalıştırma adı gerekli',
                code: 'MISSING_RUN_NAME'
            });
        }

        const startTime = Date.now();

        // Ağırlıkları al (preset veya custom)
        let finalWeights = weights;
        let polarities = {};

        if (!weights && scenarioType !== 'custom') {
            // Preset'ten al
            const presets = await query(
                'SELECT weights_json FROM scenario_presets WHERE scenario_type = ? AND is_active = TRUE LIMIT 1',
                [scenarioType]
            );
            if (presets.length > 0) {
                const weightsData = presets[0].weights_json;
                // Check if already parsed or needs parsing
                if (typeof weightsData === 'object' && weightsData !== null) {
                    finalWeights = weightsData;
                } else if (typeof weightsData === 'string') {
                    finalWeights = JSON.parse(weightsData);
                }
            }
        }

        if (!finalWeights) {
            return res.status(400).json({
                success: false,
                error: 'Ağırlıklar gerekli',
                code: 'MISSING_WEIGHTS'
            });
        }

        // Göstergelerin polaritelerini al
        const indicators = await query('SELECT code, polarity FROM indicators WHERE is_active = TRUE');
        indicators.forEach(ind => {
            polarities[ind.code] = ind.polarity;
        });

        // Şehir verilerini al
        const cityData = await query(`
            SELECT 
                c.id as cityId, c.name as cityName, c.plate_code as plateCode,
                ind.code as indicatorCode,
                iv.value
            FROM cities c
            CROSS JOIN indicators ind
            LEFT JOIN (
                SELECT iv1.*
                FROM indicator_values iv1
                INNER JOIN (
                    SELECT city_id, indicator_id, MAX(period_date) as max_date
                    FROM indicator_values
                    GROUP BY city_id, indicator_id
                ) iv2 ON iv1.city_id = iv2.city_id 
                     AND iv1.indicator_id = iv2.indicator_id 
                     AND iv1.period_date = iv2.max_date
            ) iv ON c.id = iv.city_id AND ind.id = iv.indicator_id
            WHERE ind.is_active = TRUE
            ORDER BY c.id, ind.code
        `);

        // Veriyi TOPSIS için formatla
        const cityMap = {};
        cityData.forEach(row => {
            if (!cityMap[row.cityId]) {
                cityMap[row.cityId] = {
                    cityId: row.cityId,
                    cityName: row.cityName,
                    plateCode: row.plateCode,
                    indicators: {}
                };
            }
            cityMap[row.cityId].indicators[row.indicatorCode] = row.value || 0;
        });

        const data = Object.values(cityMap);

        // TOPSIS çalıştır
        const engine = new TopsisEngine();
        const results = engine.run(data, finalWeights, polarities);

        const executionTime = Date.now() - startTime;

        // Transaction ile kaydet
        const runId = await transaction(async (conn) => {
            // Run kaydı
            const [runResult] = await conn.execute(
                `INSERT INTO topsis_runs 
                 (run_name, created_by, scenario_type, date_range_start, date_range_end, 
                  normalization_method, total_alternatives, total_criteria, status, execution_time_ms, completed_at)
                 VALUES (?, ?, ?, ?, ?, 'vector', ?, ?, 'completed', ?, NOW())`,
                [runName, req.user.id, scenarioType, dateRangeStart || null, dateRangeEnd || null,
                    results.length, Object.keys(finalWeights).length, executionTime]
            );

            const newRunId = runResult.insertId;

            // Ağırlıkları kaydet
            for (const [code, weight] of Object.entries(finalWeights)) {
                await conn.execute(
                    `INSERT INTO topsis_weights (run_id, indicator_id, weight)
                     SELECT ?, id, ? FROM indicators WHERE code = ?`,
                    [newRunId, weight, code]
                );
            }

            // Sonuçları kaydet
            for (const result of results) {
                await conn.execute(
                    `INSERT INTO topsis_results 
                     (run_id, city_id, s_plus, s_minus, c_star, rank_position)
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [newRunId, result.cityId, result.sPlus, result.sMinus, result.cStar, result.rank]
                );
            }

            return newRunId;
        });

        // Cache'i temizle
        invalidatePattern('topsis:');
        invalidatePattern('city:');

        logger.info(`TOPSIS run completed: ${runName}, ${results.length} cities, ${executionTime}ms`);

        res.json({
            success: true,
            data: {
                runId,
                runName,
                scenarioType,
                executionTimeMs: executionTime,
                totalAlternatives: results.length,
                results: results.slice(0, 10), // Top 10
                weights: finalWeights
            }
        });

    } catch (error) {
        logger.error('Run TOPSIS error:', error);
        res.status(500).json({
            success: false,
            error: 'TOPSIS çalıştırılamadı',
            code: 'RUN_TOPSIS_ERROR'
        });
    }
};

// TOPSIS çalıştırma geçmişi
const getRunHistory = async (req, res) => {
    try {
        const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);

        const runs = await query(`
            SELECT 
                tr.id, tr.run_name, tr.scenario_type, tr.status,
                tr.total_alternatives, tr.total_criteria, tr.execution_time_ms,
                tr.created_at, tr.completed_at,
                u.full_name as created_by_name
            FROM topsis_runs tr
            JOIN users u ON tr.created_by = u.id
            ORDER BY tr.created_at DESC
            LIMIT ${limit}
        `);

        res.json({
            success: true,
            data: runs
        });

    } catch (error) {
        logger.error('Get run history error:', error);
        res.status(500).json({
            success: false,
            error: 'Geçmiş alınamadı',
            code: 'GET_HISTORY_ERROR'
        });
    }
};

// TOPSIS sonuçlarını getir
const getRunResults = async (req, res) => {
    try {
        const { runId } = req.params;

        // Run bilgisi
        const runs = await query(`
            SELECT 
                tr.*, u.full_name as created_by_name
            FROM topsis_runs tr
            JOIN users u ON tr.created_by = u.id
            WHERE tr.id = ?
        `, [runId]);

        if (runs.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Çalıştırma bulunamadı',
                code: 'RUN_NOT_FOUND'
            });
        }

        // Ağırlıklar
        const weights = await query(`
            SELECT ind.code, ind.name, tw.weight
            FROM topsis_weights tw
            JOIN indicators ind ON tw.indicator_id = ind.id
            WHERE tw.run_id = ?
            ORDER BY tw.weight DESC
        `, [runId]);

        // Sonuçlar
        const results = await query(`
            SELECT 
                tr.rank_position as \`rank\`, tr.c_star as score,
                tr.s_plus, tr.s_minus, tr.investment_priority,
                c.id as city_id, c.name as city_name, c.plate_code,
                r.name as region_name
            FROM topsis_results tr
            JOIN cities c ON tr.city_id = c.id
            JOIN regions r ON c.region_id = r.id
            WHERE tr.run_id = ?
            ORDER BY tr.rank_position
        `, [runId]);

        res.json({
            success: true,
            data: {
                run: runs[0],
                weights,
                results
            }
        });

    } catch (error) {
        logger.error('Get run results error:', error);
        res.status(500).json({
            success: false,
            error: 'Sonuçlar alınamadı',
            code: 'GET_RESULTS_ERROR'
        });
    }
};

// En son TOPSIS sonuçları
const getLatestResults = async (req, res) => {
    try {
        const results = await query(`
            SELECT 
                tr.rank_position as \`rank\`, tr.c_star as score,
                tr.investment_priority,
                c.id as city_id, c.name as city_name, c.plate_code,
                c.latitude, c.longitude,
                r.name as region_name,
                trun.id as run_id, trun.run_name, trun.scenario_type
            FROM topsis_results tr
            JOIN cities c ON tr.city_id = c.id
            JOIN regions r ON c.region_id = r.id
            JOIN topsis_runs trun ON tr.run_id = trun.id
            WHERE trun.id = (
                SELECT id FROM topsis_runs 
                WHERE status = 'completed' 
                ORDER BY created_at DESC 
                LIMIT 1
            )
            ORDER BY tr.rank_position
        `);

        if (results.length === 0) {
            return res.json({
                success: true,
                data: {
                    results: [],
                    runInfo: null
                }
            });
        }

        res.json({
            success: true,
            data: {
                runId: results[0].run_id,
                runName: results[0].run_name,
                scenarioType: results[0].scenario_type,
                results
            }
        });

    } catch (error) {
        logger.error('Get latest results error:', error);
        res.status(500).json({
            success: false,
            error: 'Son sonuçlar alınamadı',
            code: 'GET_LATEST_ERROR'
        });
    }
};

// Duyarlılık analizi
const runSensitivity = async (req, res) => {
    try {
        const { runId } = req.params;

        // Run'ın ağırlıklarını al
        const weights = await query(`
            SELECT ind.code, tw.weight
            FROM topsis_weights tw
            JOIN indicators ind ON tw.indicator_id = ind.id
            WHERE tw.run_id = ?
        `, [runId]);

        if (weights.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Çalıştırma bulunamadı',
                code: 'RUN_NOT_FOUND'
            });
        }

        const baseWeights = {};
        weights.forEach(w => { baseWeights[w.code] = parseFloat(w.weight); });

        // Polariteleri al
        const indicators = await query('SELECT code, polarity FROM indicators WHERE is_active = TRUE');
        const polarities = {};
        indicators.forEach(ind => { polarities[ind.code] = ind.polarity; });

        // Şehir verilerini al
        const cityData = await query(`
            SELECT 
                c.id as cityId, c.name as cityName, c.plate_code as plateCode,
                ind.code as indicatorCode,
                iv.value
            FROM cities c
            CROSS JOIN indicators ind
            LEFT JOIN (
                SELECT iv1.*
                FROM indicator_values iv1
                INNER JOIN (
                    SELECT city_id, indicator_id, MAX(period_date) as max_date
                    FROM indicator_values
                    GROUP BY city_id, indicator_id
                ) iv2 ON iv1.city_id = iv2.city_id 
                     AND iv1.indicator_id = iv2.indicator_id 
                     AND iv1.period_date = iv2.max_date
            ) iv ON c.id = iv.city_id AND ind.id = iv.indicator_id
            WHERE ind.is_active = TRUE
        `);

        const cityMap = {};
        cityData.forEach(row => {
            if (!cityMap[row.cityId]) {
                cityMap[row.cityId] = {
                    cityId: row.cityId,
                    cityName: row.cityName,
                    plateCode: row.plateCode,
                    indicators: {}
                };
            }
            cityMap[row.cityId].indicators[row.indicatorCode] = row.value || 0;
        });

        const data = Object.values(cityMap);

        // Duyarlılık analizi
        const engine = new TopsisEngine();
        const sensitivity = engine.sensitivityAnalysis(data, baseWeights, polarities);

        res.json({
            success: true,
            data: sensitivity
        });

    } catch (error) {
        logger.error('Sensitivity analysis error:', error);
        res.status(500).json({
            success: false,
            error: 'Duyarlılık analizi yapılamadı',
            code: 'SENSITIVITY_ERROR'
        });
    }
};

// TOPSIS run silme
const deleteRun = async (req, res) => {
    try {
        const { runId } = req.params;

        // Önce run'ın var olup olmadığını kontrol et
        const runs = await query('SELECT id, run_name FROM topsis_runs WHERE id = ?', [runId]);

        if (runs.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Çalıştırma bulunamadı',
                code: 'RUN_NOT_FOUND'
            });
        }

        // Önce sonuçları sil (foreign key constraint)
        await query('DELETE FROM topsis_results WHERE run_id = ?', [runId]);

        // Sonra ağırlıkları sil
        await query('DELETE FROM topsis_weights WHERE run_id = ?', [runId]);

        // Son olarak run'ı sil
        await query('DELETE FROM topsis_runs WHERE id = ?', [runId]);

        logger.info(`TOPSIS run deleted: ${runs[0].run_name} (ID: ${runId})`);

        res.json({
            success: true,
            message: 'Analiz başarıyla silindi',
            data: { deletedRunId: parseInt(runId) }
        });

    } catch (error) {
        logger.error('Delete run error:', error);
        res.status(500).json({
            success: false,
            error: 'Analiz silinemedi',
            code: 'DELETE_RUN_ERROR'
        });
    }
};

module.exports = {
    runTopsis,
    getRunHistory,
    getRunResults,
    getLatestResults,
    runSensitivity,
    deleteRun
};
