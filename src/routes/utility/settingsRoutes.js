const express = require('express');
const router = express.Router();
const controller = require('../../controllers/utility/settingsController');

router.get('/', controller.getAll);
router.get('/:key', controller.getOne);
router.put('/:key', controller.update);
router.post('/', controller.create);

module.exports = router;
