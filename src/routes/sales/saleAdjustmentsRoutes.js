const express = require('express');
const router = express.Router();
const controller = require('../../controllers/sales/saleAdjustmentsController');

router.get('/', controller.getAll);
router.get('/sale/:saleId', controller.getBySale);
router.get('/type/:type', controller.getByType);
router.get('/:id', controller.getOne);
router.post('/', controller.create);
router.post('/:id/process', controller.process);

// Items nested
router.get('/:id/items', controller.getItems);
router.post('/:id/items', controller.addItem);
router.delete('/items/:itemId', controller.removeItem);

module.exports = router;
