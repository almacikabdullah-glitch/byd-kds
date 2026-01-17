/**
 * BYD KDS - ROI Routes
 */
const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { authMiddleware, requireRole } = require('../../middleware');

router.use(authMiddleware);

router.get('/summary', controller.getROISummary);
router.get('/city/:cityId', controller.getCityROI);
router.post('/calculate', requireRole('admin', 'manager'), controller.calculateROI);

module.exports = router;
