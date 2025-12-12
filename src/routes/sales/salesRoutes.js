const express = require('express');
const router = express.Router();
const controller = require('../../controllers/sales/salesController');
const itemsController = require('../../controllers/sales/saleItemsController');

// Item Routes (Must be before /:id routes)
router.put('/items/:itemId', itemsController.updateItem);
router.delete('/items/:itemId', itemsController.removeItem);
router.get('/items/product/:productId', itemsController.getByProduct);

// Nested Access Routes (/:id/items) - technically these contain :id so they can be anywhere if specific, 
// but /:id/items vs /:id might be ambiguous if /:id matches "123/items" (it doesn't).
// But to be safe, specific paths first.
router.get('/:id/items', itemsController.getItems);
router.post('/:id/items', itemsController.addItem);

// Sales Routes
router.get('/', controller.getAll);
router.get('/today', controller.getToday);
router.get('/daily-report', controller.getDailyReport);
router.get('/monthly-report', controller.getMonthlyReport);
router.get('/order/:orderNumber', controller.getByOrder);
router.get('/customer/:customerId', controller.getByCustomer);
router.get('/date/:date', controller.getByDate);
router.get('/range/:start/:end', controller.getByRange);
router.get('/status/:status', controller.getByStatus);
router.get('/method/:method', controller.getByMethod);
router.get('/:id', controller.getOne);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);
router.patch('/:id/status', controller.updateStatus);
router.post('/:id/cancel', controller.cancel);

module.exports = router;
