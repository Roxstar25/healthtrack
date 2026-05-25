const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const metricsController = require('../controllers/metricsController');

router.get('/', auth, metricsController.getMetrics);
router.post('/', auth, metricsController.createMetric);
router.delete('/:id', auth, metricsController.deleteMetric);

module.exports = router;
