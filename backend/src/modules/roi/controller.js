/**
 * BYD KDS - ROI Controller
 * Yatırım Geri Dönüş hesaplamaları
 */
const { query } = require('../../config/database');
const logger = require('../../config/logger');

// ROI hesapla
const calculateROI = async (req, res) => {
    try {
        const {
            topsisRunId,
            cityIds,
            stationCount = 1,
            capexPerStation = 750000, // TL
            monthlyOpex = 15000, // TL
            avgDailyUsage = 150, // kWh/gün
            pricePerKwh = 8.0, // TL/kWh
            occupancyRate = 0.65
        } = req.body;

        if (!topsisRunId) {
            return res.status(400).json({
                success: false,
                error: 'TOPSIS run ID gerekli',
                code: 'MISSING_RUN_ID'
            });
        }

        // TOPSIS sonuçlarını al
        let sql = `
            SELECT 
                tr.city_id, tr.rank_position, tr.c_star,
                c.name as city_name, c.plate_code
            FROM topsis_results tr
            JOIN cities c ON tr.city_id = c.id
            WHERE tr.run_id = ?
        `;
        const params = [topsisRunId];

        if (cityIds && cityIds.length > 0) {
            sql += ` AND tr.city_id IN (${cityIds.map(() => '?').join(',')})`;
            params.push(...cityIds);
        }

        sql += ' ORDER BY tr.rank_position';

        const topsisResults = await query(sql, params);

        if (topsisResults.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'TOPSIS sonuçları bulunamadı',
                code: 'NO_RESULTS'
            });
        }

        // Her şehir için ROI hesapla
        const results = [];

        for (const city of topsisResults) {
            // Şehir skoruna göre dinamik parametreler
            const scoreMultiplier = 0.8 + (city.c_star * 0.4); // 0.8-1.2 arası
            const adjustedUsage = avgDailyUsage * scoreMultiplier;
            const adjustedOccupancy = Math.min(0.85, occupancyRate * scoreMultiplier);

            // Hesaplamalar
            const totalCapex = stationCount * capexPerStation;
            const monthlyRevenue = adjustedUsage * 30 * pricePerKwh * adjustedOccupancy * stationCount;
            const monthlyProfit = monthlyRevenue - (monthlyOpex * stationCount);
            const paybackMonths = monthlyProfit > 0 ? totalCapex / monthlyProfit : 9999;

            // NPV hesabı (5 yıl, %15 discount rate)
            const discountRate = 0.15 / 12; // Aylık
            const periods = 60; // 5 yıl
            let npv = -totalCapex;
            for (let i = 1; i <= periods; i++) {
                npv += monthlyProfit / Math.pow(1 + discountRate, i);
            }

            // IRR tahmini (basitleştirilmiş)
            const totalProfit = monthlyProfit * periods;
            const irr = totalProfit > 0 ? ((totalProfit / totalCapex) - 1) / (periods / 12) : 0;

            const roiData = {
                cityId: city.city_id,
                cityName: city.city_name,
                plateCode: city.plate_code,
                topsisRank: city.rank_position,
                topsisScore: city.c_star,
                parameters: {
                    stationCount,
                    capexPerStation,
                    monthlyOpex,
                    avgDailyUsage: adjustedUsage,
                    pricePerKwh,
                    occupancyRate: adjustedOccupancy
                },
                financials: {
                    totalCapex,
                    monthlyRevenue: Math.round(monthlyRevenue),
                    monthlyOpex: monthlyOpex * stationCount,
                    monthlyProfit: Math.round(monthlyProfit),
                    paybackMonths: Math.round(paybackMonths * 10) / 10,
                    npv5Year: Math.round(npv),
                    estimatedIRR: Math.round(irr * 100) / 100
                },
                recommendation: getRecommendation(paybackMonths, city.rank_position)
            };

            results.push(roiData);

            // Veritabanına kaydet
            await query(`
                INSERT INTO roi_calculations 
                (topsis_run_id, city_id, station_count, capex_per_station, monthly_opex, 
                 avg_daily_usage, price_per_kwh, occupancy_rate)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    station_count = VALUES(station_count),
                    capex_per_station = VALUES(capex_per_station),
                    monthly_opex = VALUES(monthly_opex),
                    avg_daily_usage = VALUES(avg_daily_usage),
                    price_per_kwh = VALUES(price_per_kwh),
                    occupancy_rate = VALUES(occupancy_rate)
            `, [topsisRunId, city.city_id, stationCount, capexPerStation,
                monthlyOpex * stationCount, adjustedUsage, pricePerKwh, adjustedOccupancy]);
        }

        // Özet hesapla
        const summary = {
            totalCities: results.length,
            totalInvestment: results.reduce((sum, r) => sum + r.financials.totalCapex, 0),
            avgPaybackMonths: results.reduce((sum, r) => sum + r.financials.paybackMonths, 0) / results.length,
            totalMonthlyRevenue: results.reduce((sum, r) => sum + r.financials.monthlyRevenue, 0),
            priorityDistribution: {
                // Önerilen şehirler: 36 aydan kısa geri dönüş süresi olanlar
                high: results.filter(r => r.financials.paybackMonths <= 36).length,
                medium: results.filter(r => r.financials.paybackMonths > 36 && r.financials.paybackMonths <= 60).length,
                low: results.filter(r => r.financials.paybackMonths > 60).length
            }
        };

        res.json({
            success: true,
            data: {
                summary,
                results
            }
        });

    } catch (error) {
        logger.error('Calculate ROI error:', error);
        res.status(500).json({
            success: false,
            error: 'ROI hesaplanamadı',
            code: 'ROI_ERROR'
        });
    }
};

// Tavsiye belirle
function getRecommendation(paybackMonths, rank) {
    if (paybackMonths <= 24 && rank <= 10) {
        return {
            level: 'strongly_recommended',
            text: 'Yüksek öncelikli yatırım - Hemen başlayın',
            icon: '🟢'
        };
    } else if (paybackMonths <= 36 && rank <= 15) {
        return {
            level: 'recommended',
            text: 'Önerilen yatırım - 1. faz için değerlendirin',
            icon: '🟡'
        };
    } else if (paybackMonths <= 48) {
        return {
            level: 'consider',
            text: 'Değerlendirilebilir - 2. faz için planlayın',
            icon: '🟠'
        };
    } else {
        return {
            level: 'wait',
            text: 'Bekleme önerilir - Koşullar iyileştiğinde tekrar değerlendirin',
            icon: '🔴'
        };
    }
}

// Şehir için ROI getir
const getCityROI = async (req, res) => {
    try {
        const { cityId } = req.params;

        const roi = await query(`
            SELECT 
                rc.*, c.name as city_name, c.plate_code,
                tr.run_name, tr.scenario_type
            FROM roi_calculations rc
            JOIN cities c ON rc.city_id = c.id
            JOIN topsis_runs tr ON rc.topsis_run_id = tr.id
            WHERE rc.city_id = ?
            ORDER BY rc.created_at DESC
            LIMIT 1
        `, [cityId]);

        if (roi.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'ROI hesaplaması bulunamadı',
                code: 'NO_ROI'
            });
        }

        res.json({
            success: true,
            data: roi[0]
        });

    } catch (error) {
        logger.error('Get city ROI error:', error);
        res.status(500).json({
            success: false,
            error: 'ROI alınamadı',
            code: 'GET_ROI_ERROR'
        });
    }
};

// ROI özet raporu
const getROISummary = async (req, res) => {
    try {
        const { runId } = req.query;

        let sql = `
            SELECT 
                rc.city_id, c.name as city_name, c.plate_code,
                rc.station_count, rc.total_capex, rc.monthly_revenue,
                rc.monthly_profit, rc.payback_months,
                tr2.rank_position, tr2.c_star as topsis_score
            FROM roi_calculations rc
            JOIN cities c ON rc.city_id = c.id
            JOIN topsis_results tr2 ON rc.topsis_run_id = tr2.run_id AND rc.city_id = tr2.city_id
        `;

        const params = [];

        if (runId) {
            sql += ' WHERE rc.topsis_run_id = ?';
            params.push(runId);
        } else {
            sql += ` WHERE rc.topsis_run_id = (
                SELECT id FROM topsis_runs WHERE status = 'completed' ORDER BY created_at DESC LIMIT 1
            )`;
        }

        sql += ' ORDER BY rc.payback_months';

        const results = await query(sql, params);

        res.json({
            success: true,
            data: results
        });

    } catch (error) {
        logger.error('Get ROI summary error:', error);
        res.status(500).json({
            success: false,
            error: 'ROI özeti alınamadı',
            code: 'GET_SUMMARY_ERROR'
        });
    }
};

module.exports = {
    calculateROI,
    getCityROI,
    getROISummary
};
