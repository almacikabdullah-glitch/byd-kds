/**
 * BYD KDS - Cities Controller
 * City and district management
 */
const { query } = require('../../config/database');
const { cache, CACHE_KEYS, withCache } = require('../../config/cache');
const logger = require('../../config/logger');

// Get all cities with optional filters
const getAllCities = async (req, res) => {
    try {
        const { region, sort = 'plate_code', order = 'ASC', limit = 30 } = req.query;

        let sql = `
            SELECT 
                c.id, c.plate_code, c.name, c.latitude, c.longitude,
                c.population, c.area_km2, c.population_density, c.is_metropolitan,
                r.name as region_name, r.code as region_code,
                csc.last_topsis_rank, csc.last_topsis_score, csc.data_completeness,
                (SELECT COUNT(*) FROM districts d WHERE d.city_id = c.id) as district_count
            FROM cities c
            JOIN regions r ON c.region_id = r.id
            LEFT JOIN city_stats_cache csc ON c.id = csc.city_id
        `;

        const params = [];

        if (region) {
            sql += ' WHERE r.code = ?';
            params.push(region);
        }

        const validSorts = ['plate_code', 'name', 'population', 'last_topsis_rank', 'data_completeness'];
        const sortField = validSorts.includes(sort) ? sort : 'plate_code';
        const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

        sql += ` ORDER BY ${sortField} ${sortOrder} LIMIT ?`;
        params.push(parseInt(limit));

        const cities = await query(sql, params);

        res.json({
            success: true,
            data: {
                cities,
                total: cities.length
            }
        });

    } catch (error) {
        logger.error('Get cities error:', error);
        res.status(500).json({
            success: false,
            error: 'Şehirler alınamadı',
            code: 'GET_CITIES_ERROR'
        });
    }
};

// Get single city with districts
const getCityById = async (req, res) => {
    try {
        const { id } = req.params;

        // City data
        const cities = await query(`
            SELECT 
                c.*, 
                r.name as region_name, r.code as region_code,
                csc.total_indicators, csc.data_completeness, csc.avg_quality_score,
                csc.last_topsis_rank, csc.last_topsis_score, csc.last_data_update
            FROM cities c
            JOIN regions r ON c.region_id = r.id
            LEFT JOIN city_stats_cache csc ON c.id = csc.city_id
            WHERE c.id = ?
        `, [id]);

        if (cities.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Şehir bulunamadı',
                code: 'CITY_NOT_FOUND'
            });
        }

        // Districts
        const districts = await query(`
            SELECT id, name, latitude, longitude, population, area_km2, is_central
            FROM districts
            WHERE city_id = ?
            ORDER BY is_central DESC, population DESC
        `, [id]);

        // Latest indicator values
        const indicators = await query(`
            SELECT 
                ind.code, ind.name, ind.category, ind.unit, ind.polarity,
                iv.value, iv.quality_score, iv.period_date,
                ds.name as source_name
            FROM indicator_values iv
            JOIN indicators ind ON iv.indicator_id = ind.id
            JOIN data_sources ds ON iv.source_id = ds.id
            WHERE iv.city_id = ?
            AND iv.period_date = (
                SELECT MAX(iv2.period_date) 
                FROM indicator_values iv2 
                WHERE iv2.city_id = iv.city_id AND iv2.indicator_id = iv.indicator_id
            )
            ORDER BY ind.category, ind.code
        `, [id]);

        res.json({
            success: true,
            data: {
                city: cities[0],
                districts,
                indicators
            }
        });

    } catch (error) {
        logger.error('Get city error:', error);
        res.status(500).json({
            success: false,
            error: 'Şehir bilgisi alınamadı',
            code: 'GET_CITY_ERROR'
        });
    }
};

// Get city for map (lightweight)
const getCitiesForMap = async (req, res) => {
    try {
        const cities = await query(`
            SELECT 
                c.id, c.plate_code, c.name, c.latitude, c.longitude,
                c.population, c.is_metropolitan,
                csc.last_topsis_rank, csc.last_topsis_score
            FROM cities c
            LEFT JOIN city_stats_cache csc ON c.id = csc.city_id
            ORDER BY c.plate_code
        `);

        res.json({
            success: true,
            data: cities
        });

    } catch (error) {
        logger.error('Get map cities error:', error);
        res.status(500).json({
            success: false,
            error: 'Harita verisi alınamadı',
            code: 'GET_MAP_ERROR'
        });
    }
};

// Get city statistics summary
const getCitySummary = async (req, res) => {
    try {
        const summary = await query(`
            SELECT 
                COUNT(*) as total_cities,
                SUM(population) as total_population,
                AVG(population_density) as avg_density,
                SUM(CASE WHEN is_metropolitan = 1 THEN 1 ELSE 0 END) as metropolitan_count,
                (SELECT COUNT(*) FROM districts) as total_districts
            FROM cities
        `);

        const topCities = await query(`
            SELECT c.name, c.plate_code, csc.last_topsis_score, csc.last_topsis_rank
            FROM cities c
            JOIN city_stats_cache csc ON c.id = csc.city_id
            WHERE csc.last_topsis_rank IS NOT NULL
            ORDER BY csc.last_topsis_rank
            LIMIT 5
        `);

        res.json({
            success: true,
            data: {
                ...summary[0],
                topCities
            }
        });

    } catch (error) {
        logger.error('Get summary error:', error);
        res.status(500).json({
            success: false,
            error: 'Özet alınamadı',
            code: 'GET_SUMMARY_ERROR'
        });
    }
};

module.exports = {
    getAllCities,
    getCityById,
    getCitiesForMap,
    getCitySummary
};
