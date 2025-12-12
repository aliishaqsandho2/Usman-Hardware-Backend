const express = require('express');
const router = express.Router();
const controller = require('../../controllers/auth/activitiesController');

router.get('/', controller.getActivities);
router.get('/user/:userId', controller.getUserActivities);
router.get('/module/:module', controller.getModuleActivities);
router.get('/action/:action', controller.getActionActivities);
router.post('/', controller.logActivity);

module.exports = router;
