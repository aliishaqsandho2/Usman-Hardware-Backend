const express = require('express');
const router = express.Router();
const controller = require('../../controllers/utility/backupController');

router.post('/backup', controller.createBackup);
router.get('/backups', controller.getBackups);
router.post('/restore', controller.restore);
router.delete('/backups/:id', controller.deleteBackup);

module.exports = router;
