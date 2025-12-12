const express = require('express');
const router = express.Router();
const controller = require('../../controllers/procurement/purchaseOrdersController');
const itemsRouter = require('./purchaseOrderItemsRoutes');

router.get('/', controller.getAll);
router.get('/pending-delivery', controller.getPendingDelivery);
router.get('/supplier/:supplierId', controller.getBySupplier);
router.get('/status/:status', controller.getByStatus);
router.get('/order/:orderNumber', controller.getByOrder);
router.get('/:id', controller.getOne);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);
router.patch('/:id/status', controller.updateStatus);
router.post('/:id/receive', controller.receive);

// Mount Items Router
router.use('/', itemsRouter); // This handles /:id/items etc. if itemsRouter has /:id/items
// Wait, itemsRouter has /:id/items. So if I mount at /, it matches.
// But wait, itemsRouter uses get('/:id/items') so it matches /api/purchase-orders/:id/items. Correct.
// And also check for standalone item routes if any.
// Items router has /items/:itemId. So /api/purchase-orders/items/:itemId. Correct.

module.exports = router;
