/**
 * BYD KDS - Metrics Routes
 */
const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { authMiddleware } = require('../../middleware');

router.use(authMiddleware);

router.get('/indicators', controller.getIndicators);
router.get('/latest', controller.getLatestMetrics);
router.get('/completeness', controller.getDataCompleteness);
router.get('/city/:cityId', controller.getCityMetrics);
router.get('/city/:cityId/history', controller.getMetricsHistory);

module.exports = router;
