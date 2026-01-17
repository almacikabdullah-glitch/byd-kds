/**
 * BYD KDS - Error Handler Middleware
 */
const logger = require('../config/logger');

// Not found handler
const notFoundHandler = (req, res, next) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint bulunamadı',
        code: 'NOT_FOUND',
        path: req.originalUrl
    });
};

// Global error handler
const errorHandler = (err, req, res, next) => {
    logger.error('Error:', err);

    // Validation errors
    if (err.name === 'ValidationError' || err.type === 'validation') {
        return res.status(400).json({
            success: false,
            error: 'Validasyon hatası',
            code: 'VALIDATION_ERROR',
            details: err.details || err.message
        });
    }

    // Database errors
    if (err.code && err.code.startsWith('ER_')) {
        return res.status(500).json({
            success: false,
            error: 'Veritabanı hatası',
            code: 'DB_ERROR'
        });
    }

    // Default error
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        error: err.message || 'Sunucu hatası',
        code: err.code || 'SERVER_ERROR'
    });
};

module.exports = { notFoundHandler, errorHandler };
