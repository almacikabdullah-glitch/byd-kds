/**
 * BYD KDS - Cities Routes
 */
const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { authMiddleware } = require('../../middleware');

// All routes require authentication
router.use(authMiddleware);

router.get('/', controller.getAllCities);
router.get('/map', controller.getCitiesForMap);
router.get('/summary', controller.getCitySummary);
router.get('/:id', controller.getCityById);

module.exports = router;
