/**
 * BYD KDS - JWT Configuration
 */
module.exports = {
    accessToken: {
        secret: process.env.JWT_SECRET || 'byd-kds-secret-key',
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    },
    refreshToken: {
        secret: process.env.JWT_REFRESH_SECRET || 'byd-kds-refresh-secret',
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    }
};
