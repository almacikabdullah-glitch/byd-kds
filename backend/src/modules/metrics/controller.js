/**
 * BYD KDS - Metrics Controller
 * Indicator values and metrics management
 */
const { query } = require('../../config/database');
const logger = require('../../config/logger');

// Get all indicators
const getIndicators = async (req, res) => {
    try {
        const { category, active = 'true' } = req.query;

        let sql = 'SELECT * FROM indicators WHERE 1=1';
        const params = [];

        if (active === 'true') {
            sql += ' AND is_active = TRUE';
        }

        if (category) {
            sql += ' AND category = ?';
            params.push(category);
        }

        sql += ' ORDER BY category, code';

        const indicators = await query(sql, params);

        res.json({
            success: true,
            data: indicators
        });

    } catch (error) {
        logger.error('Get indicators error:', error);
        res.status(500).json({
            success: false,
            error: 'Göstergeler alınamadı',
            code: 'GET_INDICATORS_ERROR'
        });
    }
};

// Get latest metrics for all cities
const getLatestMetrics = async (req, res) => {
    try {
        const metrics = await query(`
            SELECT 
                c.id as city_id, c.name as city_name, c.plate_code,
                ind.code as indicator_code, ind.name as indicator_name,
                ind.category, ind.polarity, ind.unit,
                iv.value, iv.quality_score, iv.period_date
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
            ORDER BY c.plate_code, ind.code
        `);

        // Group by city
        const grouped = {};
        metrics.forEach(m => {
            if (!grouped[m.city_id]) {
                grouped[m.city_id] = {
                    city_id: m.city_id,
                    city_name: m.city_name,
                    plate_code: m.plate_code,
                    indicators: {}
                };
            }
            grouped[m.city_id].indicators[m.indicator_code] = {
                value: m.value,
                quality_score: m.quality_score,
                period_date: m.period_date,
                unit: m.unit,
                polarity: m.polarity
            };
        });

        res.json({
            success: true,
            data: Object.values(grouped)
        });

    } catch (error) {
        logger.error('Get latest metrics error:', error);
        res.status(500).json({
            success: false,
            error: 'Metrikler alınamadı',
            code: 'GET_METRICS_ERROR'
        });
    }
};

// Get metrics for specific city
const getCityMetrics = async (req, res) => {
    try {
        const { cityId } = req.params;
        const { from, to } = req.query;

        let sql = `
            SELECT 
                ind.code, ind.name, ind.category, ind.unit, ind.polarity,
                iv.value, iv.quality_score, iv.period_date,
                ds.name as source_name
            FROM indicator_values iv
            JOIN indicators ind ON iv.indicator_id = ind.id
            JOIN data_sources ds ON iv.source_id = ds.id
            WHERE iv.city_id = ? AND ind.is_active = TRUE
        `;
        const params = [cityId];

        if (from) {
            sql += ' AND iv.period_date >= ?';
            params.push(from);
        }

        if (to) {
            sql += ' AND iv.period_date <= ?';
            params.push(to);
        }

        sql += ' ORDER BY iv.period_date DESC, ind.code';

        const metrics = await query(sql, params);

        res.json({
            success: true,
            data: metrics
        });

    } catch (error) {
        logger.error('Get city metrics error:', error);
        res.status(500).json({
            success: false,
            error: 'Şehir metrikleri alınamadı',
            code: 'GET_CITY_METRICS_ERROR'
        });
    }
};

// Get metrics history for trend analysis
const getMetricsHistory = async (req, res) => {
    try {
        const { cityId } = req.params;
        const { indicator } = req.query;

        if (!indicator) {
            return res.status(400).json({
                success: false,
                error: 'Gösterge kodu gerekli',
                code: 'MISSING_INDICATOR'
            });
        }

        const history = await query(`
            SELECT 
                iv.period_date, iv.value, iv.quality_score
            FROM indicator_values iv
            JOIN indicators ind ON iv.indicator_id = ind.id
            WHERE iv.city_id = ? AND ind.code = ?
            ORDER BY iv.period_date ASC
        `, [cityId, indicator]);

        res.json({
            success: true,
            data: history
        });

    } catch (error) {
        logger.error('Get metrics history error:', error);
        res.status(500).json({
            success: false,
            error: 'Metrik geçmişi alınamadı',
            code: 'GET_HISTORY_ERROR'
        });
    }
};

// Get data completeness report
const getDataCompleteness = async (req, res) => {
    try {
        const report = await query(`
            SELECT 
                c.id, c.name, c.plate_code,
                csc.total_indicators,
                csc.data_completeness,
                csc.avg_quality_score,
                csc.last_data_update,
                (SELECT COUNT(*) FROM indicators WHERE is_active = TRUE) as expected_indicators
            FROM cities c
            LEFT JOIN city_stats_cache csc ON c.id = csc.city_id
            ORDER BY csc.data_completeness DESC
        `);

        res.json({
            success: true,
            data: report
        });

    } catch (error) {
        logger.error('Get completeness error:', error);
        res.status(500).json({
            success: false,
            error: 'Veri tamlık raporu alınamadı',
            code: 'GET_COMPLETENESS_ERROR'
        });
    }
};

module.exports = {
    getIndicators,
    getLatestMetrics,
    getCityMetrics,
    getMetricsHistory,
    getDataCompleteness
};
