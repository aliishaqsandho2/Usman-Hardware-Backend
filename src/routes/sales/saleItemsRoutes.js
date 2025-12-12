const express = require('express');
const router = express.Router({ mergeParams: true });
const controller = require('../../controllers/sales/saleItemsController');

router.get('/:id/items', controller.getItems);
router.post('/:id/items', controller.addItem);
router.put('/items/:itemId', controller.updateItem);
router.delete('/items/:itemId', controller.removeItem);
router.get('/items/product/:productId', controller.getByProduct);

module.exports = router;
