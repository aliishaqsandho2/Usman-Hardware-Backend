const express = require('express');
const router = express.Router();
const controller = require('../../controllers/utility/dataController');

router.post('/import', controller.importData);
router.get('/export', controller.exportData);
router.get('/templates', controller.getTemplates);

module.exports = router;
