/**
 * BYD KDS - TOPSIS Routes
 */
const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { authMiddleware, requireRole } = require('../../middleware');

router.use(authMiddleware);

// Read endpoints
router.get('/latest', controller.getLatestResults);
router.get('/runs', controller.getRunHistory);
router.get('/runs/:runId', controller.getRunResults);
router.get('/runs/:runId/sensitivity', controller.runSensitivity);

// Write endpoints (admin/manager only)
router.post('/run', requireRole('admin', 'manager'), controller.runTopsis);
router.delete('/runs/:runId', requireRole('admin', 'manager'), controller.deleteRun);

module.exports = router;
