/**
 * BYD KDS - Auth Routes
 */
const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { authMiddleware } = require('../../middleware');

// Public routes
router.post('/login', controller.login);
router.post('/refresh', controller.refreshToken);

// Protected routes
router.get('/me', authMiddleware, controller.me);

module.exports = router;
