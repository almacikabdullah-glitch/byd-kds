/**
 * BYD KDS - Auth Controller
 * Login, token refresh, user info
 */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../../config/database');
const jwtConfig = require('../../config/jwt');
const logger = require('../../config/logger');

// Generate tokens
const generateTokens = (user) => {
    const accessToken = jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.full_name
        },
        jwtConfig.accessToken.secret,
        { expiresIn: jwtConfig.accessToken.expiresIn }
    );

    const refreshToken = jwt.sign(
        { id: user.id },
        jwtConfig.refreshToken.secret,
        { expiresIn: jwtConfig.refreshToken.expiresIn }
    );

    return { accessToken, refreshToken };
};

// Login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email ve şifre gerekli',
                code: 'MISSING_CREDENTIALS'
            });
        }

        // Find user
        const users = await query(
            'SELECT id, email, password_hash, full_name, role, is_active FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                error: 'Geçersiz email veya şifre',
                code: 'INVALID_CREDENTIALS'
            });
        }

        const user = users[0];

        if (!user.is_active) {
            return res.status(403).json({
                success: false,
                error: 'Hesap devre dışı',
                code: 'ACCOUNT_DISABLED'
            });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                error: 'Geçersiz email veya şifre',
                code: 'INVALID_CREDENTIALS'
            });
        }

        // Update last login
        await query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

        // Generate tokens
        const tokens = generateTokens(user);

        // Log audit
        await query(
            'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details_json) VALUES (?, ?, ?, ?, ?)',
            [user.id, 'LOGIN', 'users', user.id, JSON.stringify({ ip: req.ip })]
        );

        logger.info(`User logged in: ${user.email}`);

        res.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.full_name,
                    role: user.role
                },
                ...tokens
            }
        });

    } catch (error) {
        logger.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Giriş yapılamadı',
            code: 'LOGIN_ERROR'
        });
    }
};

// Refresh token
const refreshToken = async (req, res) => {
    try {
        const { refreshToken: token } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                error: 'Refresh token gerekli',
                code: 'MISSING_TOKEN'
            });
        }

        const decoded = jwt.verify(token, jwtConfig.refreshToken.secret);

        const users = await query(
            'SELECT id, email, full_name, role, is_active FROM users WHERE id = ?',
            [decoded.id]
        );

        if (users.length === 0 || !users[0].is_active) {
            return res.status(401).json({
                success: false,
                error: 'Geçersiz token',
                code: 'INVALID_TOKEN'
            });
        }

        const tokens = generateTokens(users[0]);

        res.json({
            success: true,
            data: tokens
        });

    } catch (error) {
        logger.error('Refresh token error:', error);
        res.status(401).json({
            success: false,
            error: 'Token yenilenemedi',
            code: 'REFRESH_ERROR'
        });
    }
};

// Get current user
const me = async (req, res) => {
    try {
        const users = await query(
            'SELECT id, email, full_name, role, created_at, last_login FROM users WHERE id = ?',
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Kullanıcı bulunamadı',
                code: 'USER_NOT_FOUND'
            });
        }

        res.json({
            success: true,
            data: users[0]
        });

    } catch (error) {
        logger.error('Get user error:', error);
        res.status(500).json({
            success: false,
            error: 'Kullanıcı bilgisi alınamadı',
            code: 'GET_USER_ERROR'
        });
    }
};

module.exports = { login, refreshToken, me };
