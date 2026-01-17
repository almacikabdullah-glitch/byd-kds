/**
 * BYD KDS - Forecast Routes
 */
const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { authMiddleware, requireRole } = require('../../middleware');

router.use(authMiddleware);

router.get('/models', controller.getModels);
router.get('/city/:cityId', controller.getCityForecast);
router.post('/run', requireRole('admin', 'manager'), controller.runForecast);

module.exports = router;
