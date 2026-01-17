/**
 * BYD Türkiye EV Şarj İstasyonu Karar Destek Sistemi
 * Backend API - Express Application
 */
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Config
const { db, logger } = require('./src/config');

// Middleware
const { notFoundHandler, errorHandler } = require('./src/middleware');

// Routes
const authRoutes = require('./src/modules/auth/routes');
const citiesRoutes = require('./src/modules/cities/routes');
const metricsRoutes = require('./src/modules/metrics/routes');
const topsisRoutes = require('./src/modules/topsis/routes');
const forecastRoutes = require('./src/modules/forecast/routes');
const scenariosRoutes = require('./src/modules/scenarios/routes');
const roiRoutes = require('./src/modules/roi/routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
    message: {
        success: false,
        error: 'Çok fazla istek gönderildi, lütfen bekleyin',
        code: 'RATE_LIMITED'
    }
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.debug(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    });
    next();
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/cities', citiesRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/topsis', topsisRoutes);
app.use('/api/forecast', forecastRoutes);
app.use('/api/scenarios', scenariosRoutes);
app.use('/api/roi', roiRoutes);

// Dashboard summary endpoint
app.get('/api/dashboard', require('./src/middleware').authMiddleware, async (req, res) => {
    try {
        // Top 5 şehirler
        const top5 = await db.query(`
            SELECT c.name, c.plate_code, csc.last_topsis_rank, csc.last_topsis_score
            FROM cities c
            JOIN city_stats_cache csc ON c.id = csc.city_id
            WHERE csc.last_topsis_rank IS NOT NULL
            ORDER BY csc.last_topsis_rank
            LIMIT 5
        `);

        // Genel istatistikler
        const stats = await db.query(`
            SELECT 
                COUNT(*) as total_cities,
                AVG(csc.last_topsis_score) as avg_score,
                AVG(csc.data_completeness) as avg_completeness,
                (SELECT COUNT(*) FROM topsis_runs WHERE status = 'completed') as total_runs
            FROM cities c
            LEFT JOIN city_stats_cache csc ON c.id = csc.city_id
        `);

        // Son TOPSIS run bilgisi
        const lastRun = await db.query(`
            SELECT id, run_name, scenario_type, created_at
            FROM topsis_runs
            WHERE status = 'completed'
            ORDER BY created_at DESC
            LIMIT 1
        `);

        // Bölge dağılımı
        const regionStats = await db.query(`
            SELECT 
                r.name as region,
                COUNT(*) as city_count,
                AVG(csc.last_topsis_score) as avg_score
            FROM cities c
            JOIN regions r ON c.region_id = r.id
            LEFT JOIN city_stats_cache csc ON c.id = csc.city_id
            GROUP BY r.id, r.name
        `);

        res.json({
            success: true,
            data: {
                topCities: top5,
                summary: stats[0],
                lastRun: lastRun[0] || null,
                regionStats
            }
        });
    } catch (error) {
        logger.error('Dashboard error:', error);
        res.status(500).json({
            success: false,
            error: 'Dashboard verisi alınamadı',
            code: 'DASHBOARD_ERROR'
        });
    }
});

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const startServer = async () => {
    // Test database connection
    const dbConnected = await db.testConnection();

    if (!dbConnected) {
        logger.error('Veritabanına bağlanılamadı. MAMP MySQL\'in çalıştığından emin olun.');
        process.exit(1);
    }

    app.listen(PORT, () => {
        logger.info(`🚀 BYD KDS Backend API http://localhost:${PORT} adresinde çalışıyor`);
        logger.info(`📊 Health check: http://localhost:${PORT}/api/health`);
        logger.info(`🔒 Ortam: ${process.env.NODE_ENV || 'development'}`);
    });
};

startServer().catch(err => {
    logger.error('Sunucu başlatılamadı:', err);
    process.exit(1);
});

module.exports = app;
