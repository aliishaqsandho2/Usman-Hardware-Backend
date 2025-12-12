const express = require('express');
const router = express.Router();
const controller = require('../../controllers/inventory/productImagesController');

// Routes mounted at /api/products via server.js
router.get('/:id/images', controller.getProductImages);
router.post('/:id/images', controller.uploadProductImage);
router.delete('/images/:imageId', controller.deleteProductImage);
router.patch('/images/:imageId/primary', controller.setPrimaryImage);

module.exports = router;
