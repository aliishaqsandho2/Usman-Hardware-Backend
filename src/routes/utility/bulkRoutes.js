const express = require('express');
const router = express.Router();
const controller = require('../../controllers/utility/bulkController');

router.post('/update', controller.bulkUpdate);
router.post('/delete', controller.bulkDelete);
router.post('/status', controller.bulkStatus);

module.exports = router;
