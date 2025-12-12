const express = require('express');
const router = express.Router();
const controller = require('../../controllers/sales/quotationsController');

router.get('/', controller.getAll);
router.get('/customer/:customerId', controller.getByCustomer);
router.get('/status/:status', controller.getByStatus);
router.get('/valid-until/:date', controller.getExpiring);
router.get('/:id', controller.getOne);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);
router.patch('/:id/status', controller.updateStatus);
router.post('/:id/convert-to-sale', controller.convertToSale);

// Nested Items
router.get('/:id/items', controller.getItems);
router.post('/:id/items', controller.addItem);
router.put('/items/:itemId', controller.updateItem);
router.delete('/items/:itemId', controller.removeItem);

module.exports = router;
