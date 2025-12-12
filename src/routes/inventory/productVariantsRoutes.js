const express = require('express');
const router = express.Router();
const controller = require('../../controllers/inventory/productVariantsController');

// Routes mounted at /api/products via server.js
router.get('/:id/variants', controller.getProductVariants);
router.post('/:id/variants', controller.createVariant);
router.put('/variants/:variantId', controller.updateVariant);
router.delete('/variants/:variantId', controller.deleteVariant);
router.get('/variants/attribute/:name', controller.getVariantsByAttribute);

module.exports = router;
