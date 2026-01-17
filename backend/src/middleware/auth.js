/**
 * BYD KDS - Auth Middleware
 * JWT token verification
 */
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const logger = require('../config/logger');

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Yetkilendirme gerekli',
                code: 'AUTH_REQUIRED'
            });
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, jwtConfig.accessToken.secret);
        req.user = decoded;

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                error: 'Token süresi dolmuş',
                code: 'TOKEN_EXPIRED'
            });
        }

        logger.error('Auth error:', error.message);
        return res.status(401).json({
            success: false,
            error: 'Geçersiz token',
            code: 'INVALID_TOKEN'
        });
    }
};

// Role checking middleware factory
const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Yetkilendirme gerekli',
                code: 'AUTH_REQUIRED'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: 'Bu işlem için yetkiniz yok',
                code: 'FORBIDDEN'
            });
        }

        next();
    };
};

module.exports = { authMiddleware, requireRole };
