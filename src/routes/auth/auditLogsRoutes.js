const express = require('express');
const router = express.Router();
const controller = require('../../controllers/auth/auditLogsController');

router.get('/', controller.getAuditLogs);
router.get('/user/:userId', controller.getUserAuditLogs);
router.get('/table/:table', controller.getTableLogs);
router.get('/record/:table/:recordId', controller.getRecordHistory);

module.exports = router;
