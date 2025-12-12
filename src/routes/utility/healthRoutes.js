const express = require('express');
const router = express.Router();
const controller = require('../../controllers/utility/healthController');

router.get('/health', controller.getHealth);
router.get('/status', controller.getStatus);
router.get('/logs', controller.getLogs);
router.get('/metrics', controller.getMetrics);

module.exports = router;
