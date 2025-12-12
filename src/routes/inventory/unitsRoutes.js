const express = require('express');
const router = express.Router();
const controller = require('../../controllers/inventory/unitsController');

router.get('/', controller.getAll);
router.patch('/:id/status', controller.toggleStatus); // Specific route before generic /:id
router.get('/:id', controller.getOne);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

module.exports = router;
