const express = require('express');
const router = express.Router({ mergeParams: true }); // Merge params to access :id from parent route if nested
const controller = require('../../controllers/procurement/purchaseOrderItemsController');

// These routes expect to be mounted under /api/purchase-orders/:id/items OR standalone?
// The plan implies nested for get/add, but maybe standalone for update/delete/receive if ID is unique?
// Let's stick to the route structure in previous purchaseOrdersRoutes.js which had mixed.

// Actually, if we use mergeParams, we can handle /:id/items in the main router or here.
// But usually, standard practice:
// GET /api/purchase-orders/:id/items -> list
// POST /api/purchase-orders/:id/items -> create
// PUT /api/purchase-orders/items/:itemId -> update (standalone)
// DELETE /api/purchase-orders/items/:itemId -> delete (standalone)

// Let's see how I can structure this.
// I will keep the nested structure in `purchaseOrdersRoutes.js` for list/create, and maybe mount this router there?
// Or I can define all here and mount this router in server.js.

// If I mount in server.js, I need to know the base path.
// If I use /api/purchase-orders, I can just handle everything there.
// BUT, creating a separate route file is cleaner.

// Let's assume this router handles:
// GET /:id/items
// POST /:id/items
// PUT /items/:itemId
// DELETE /items/:itemId
// PATCH /items/:itemId/receive

// Wait, standard route is usually RESOURCE based.
// /api/purchase-order-items/
// But the user requirements (list 288) says: /api/purchase-orders/{id}/items

// So let's modify purchaseOrdersRoutes to USE this controller for those definitions, OR import this router.
// Actually, I'll just export the routes here and mount them properly.

router.get('/:id/items', controller.getItems);
router.post('/:id/items', controller.addItem);
router.put('/items/:itemId', controller.updateItem);
router.delete('/items/:itemId', controller.removeItem);
router.patch('/items/:itemId/receive', controller.receiveItem);

module.exports = router;
