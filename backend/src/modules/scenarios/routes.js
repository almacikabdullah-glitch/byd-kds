/**
 * BYD KDS - Scenarios Routes
 */
const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { authMiddleware, requireRole } = require('../../middleware');

router.use(authMiddleware);

router.get('/presets', controller.getPresets);
router.get('/presets/:id', controller.getPreset);
router.post('/presets', requireRole('admin', 'manager'), controller.createPreset);
router.put('/presets/:id', requireRole('admin', 'manager'), controller.updatePreset);
router.delete('/presets/:id', requireRole('admin', 'manager'), controller.deletePreset);

module.exports = router;
