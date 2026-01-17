/**
 * BYD KDS - Forecast Controller
 * Tahminleme modülü - EV büyümesi ve şarj talebi
 */
const { query } = require('../../config/database');
const logger = require('../../config/logger');

/**
 * Basit trend bazlı tahminleme
 * Gerçek projede ARIMA/Prophet kullanılabilir
 */
class SimpleForecast {
    /**
     * Linear trend ile tahmin
     */
    static linearTrend(data, horizonMonths = 12) {
        if (data.length < 2) {
            return this.generateConstantForecast(data[0]?.value || 100, horizonMonths);
        }

        // Linear regression
        const n = data.length;
        let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

        data.forEach((d, i) => {
            sumX += i;
            sumY += d.value;
            sumXY += i * d.value;
            sumX2 += i * i;
        });

        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        // Tahminler
        const forecasts = [];
        const lastDate = new Date(data[data.length - 1].date);
        const stdDev = this.calculateStdDev(data.map(d => d.value));

        for (let i = 1; i <= horizonMonths; i++) {
            const forecastDate = new Date(lastDate);
            forecastDate.setMonth(forecastDate.getMonth() + i);

            const yhat = intercept + slope * (n + i - 1);
            const uncertainty = stdDev * Math.sqrt(i) * 0.5;

            forecasts.push({
                date: forecastDate.toISOString().split('T')[0],
                yhat: Math.max(0, yhat),
                yhat_lower: Math.max(0, yhat - uncertainty * 1.96),
                yhat_upper: yhat + uncertainty * 1.96
            });
        }

        return forecasts;
    }

    /**
     * Exponential growth tahmin
     */
    static exponentialGrowth(data, horizonMonths = 12, growthRate = 0.02) {
        if (data.length < 1) {
            return this.generateConstantForecast(100, horizonMonths);
        }

        const lastValue = data[data.length - 1].value;
        const lastDate = new Date(data[data.length - 1].date);
        const forecasts = [];

        for (let i = 1; i <= horizonMonths; i++) {
            const forecastDate = new Date(lastDate);
            forecastDate.setMonth(forecastDate.getMonth() + i);

            const yhat = lastValue * Math.pow(1 + growthRate, i);
            const uncertainty = yhat * 0.15; // %15 belirsizlik

            forecasts.push({
                date: forecastDate.toISOString().split('T')[0],
                yhat,
                yhat_lower: yhat - uncertainty,
                yhat_upper: yhat + uncertainty
            });
        }

        return forecasts;
    }

    static generateConstantForecast(value, horizonMonths) {
        const forecasts = [];
        const startDate = new Date();

        for (let i = 1; i <= horizonMonths; i++) {
            const forecastDate = new Date(startDate);
            forecastDate.setMonth(forecastDate.getMonth() + i);

            forecasts.push({
                date: forecastDate.toISOString().split('T')[0],
                yhat: value,
                yhat_lower: value * 0.9,
                yhat_upper: value * 1.1
            });
        }

        return forecasts;
    }

    static calculateStdDev(values) {
        const n = values.length;
        if (n < 2) return 0;

        const mean = values.reduce((a, b) => a + b, 0) / n;
        const squareDiffs = values.map(v => Math.pow(v - mean, 2));
        return Math.sqrt(squareDiffs.reduce((a, b) => a + b, 0) / (n - 1));
    }

    static calculateMAPE(actual, predicted) {
        if (actual.length !== predicted.length || actual.length === 0) return null;

        let sum = 0;
        let count = 0;

        for (let i = 0; i < actual.length; i++) {
            if (actual[i] !== 0) {
                sum += Math.abs((actual[i] - predicted[i]) / actual[i]);
                count++;
            }
        }

        return count > 0 ? (sum / count) * 100 : null;
    }
}

// Tahmin çalıştır
const runForecast = async (req, res) => {
    try {
        const {
            targetCode = 'EV_COUNT',
            modelType = 'exponential',
            horizonMonths = 12,
            cityIds
        } = req.body;

        // Hangi şehirler için tahmin yapılacak
        let cityFilter = '';
        const params = [targetCode];

        if (cityIds && cityIds.length > 0) {
            cityFilter = ` AND c.id IN (${cityIds.map(() => '?').join(',')})`;
            params.push(...cityIds);
        }

        // Geçmiş verileri al
        const historicalData = await query(`
            SELECT 
                c.id as city_id, c.name as city_name, c.plate_code,
                iv.period_date as date, iv.value
            FROM cities c
            JOIN indicator_values iv ON c.id = iv.city_id
            JOIN indicators ind ON iv.indicator_id = ind.id
            WHERE ind.code = ? ${cityFilter}
            ORDER BY c.id, iv.period_date
        `, params);

        // Şehir bazlı grupla
        const cityGroups = {};
        historicalData.forEach(row => {
            if (!cityGroups[row.city_id]) {
                cityGroups[row.city_id] = {
                    cityId: row.city_id,
                    cityName: row.city_name,
                    plateCode: row.plate_code,
                    history: []
                };
            }
            cityGroups[row.city_id].history.push({
                date: row.date,
                value: parseFloat(row.value)
            });
        });

        // Her şehir için tahmin yap
        const results = [];
        const modelParams = { horizonMonths, growthRate: 0.03 }; // %3 aylık büyüme varsayımı

        for (const city of Object.values(cityGroups)) {
            let forecasts;

            if (modelType === 'exponential') {
                forecasts = SimpleForecast.exponentialGrowth(
                    city.history,
                    horizonMonths,
                    modelParams.growthRate
                );
            } else {
                forecasts = SimpleForecast.linearTrend(city.history, horizonMonths);
            }

            results.push({
                cityId: city.cityId,
                cityName: city.cityName,
                plateCode: city.plateCode,
                forecasts
            });
        }

        // Eğer hiç veri yoksa, tüm şehirler için varsayılan tahmin üret
        if (results.length === 0) {
            const allCities = await query('SELECT id, name, plate_code FROM cities');
            for (const city of allCities) {
                results.push({
                    cityId: city.id,
                    cityName: city.name,
                    plateCode: city.plate_code,
                    forecasts: SimpleForecast.generateConstantForecast(100, horizonMonths)
                });
            }
        }

        res.json({
            success: true,
            data: {
                targetCode,
                modelType,
                horizonMonths,
                totalCities: results.length,
                results
            }
        });

    } catch (error) {
        logger.error('Run forecast error:', error);
        res.status(500).json({
            success: false,
            error: 'Tahmin çalıştırılamadı',
            code: 'RUN_FORECAST_ERROR'
        });
    }
};

// Şehir için tahmin getir
const getCityForecast = async (req, res) => {
    try {
        const { cityId } = req.params;
        const { target = 'EV_COUNT' } = req.query;

        // Kayıtlı tahminleri kontrol et
        const savedForecasts = await query(`
            SELECT 
                fr.forecast_date, fr.yhat, fr.yhat_lower, fr.yhat_upper,
                fm.model_type, fm.metrics_json
            FROM forecast_results fr
            JOIN forecast_models fm ON fr.model_id = fm.id
            WHERE fr.city_id = ? AND fr.target_code = ? AND fm.is_active = TRUE
            ORDER BY fr.forecast_date
        `, [cityId, target]);

        if (savedForecasts.length > 0) {
            return res.json({
                success: true,
                data: {
                    source: 'database',
                    forecasts: savedForecasts
                }
            });
        }

        // Yoksa yeni tahmin üret
        const history = await query(`
            SELECT iv.period_date as date, iv.value
            FROM indicator_values iv
            JOIN indicators ind ON iv.indicator_id = ind.id
            WHERE iv.city_id = ? AND ind.code = ?
            ORDER BY iv.period_date
        `, [cityId, target]);

        const forecasts = history.length >= 2
            ? SimpleForecast.exponentialGrowth(history.map(h => ({
                date: h.date,
                value: parseFloat(h.value)
            })), 12, 0.03)
            : SimpleForecast.generateConstantForecast(100, 12);

        res.json({
            success: true,
            data: {
                source: 'generated',
                forecasts
            }
        });

    } catch (error) {
        logger.error('Get city forecast error:', error);
        res.status(500).json({
            success: false,
            error: 'Şehir tahmini alınamadı',
            code: 'GET_FORECAST_ERROR'
        });
    }
};

// Tahmin modelleri listesi
const getModels = async (req, res) => {
    try {
        const models = await query(`
            SELECT 
                id, target_code, model_type, params_json, metrics_json,
                training_start_date, training_end_date, horizon_months,
                is_active, trained_at
            FROM forecast_models
            ORDER BY trained_at DESC
        `);

        res.json({
            success: true,
            data: models
        });

    } catch (error) {
        logger.error('Get models error:', error);
        res.status(500).json({
            success: false,
            error: 'Modeller alınamadı',
            code: 'GET_MODELS_ERROR'
        });
    }
};

module.exports = {
    runForecast,
    getCityForecast,
    getModels
};
