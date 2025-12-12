const express = require('express');
const router = express.Router();
const controller = require('../../controllers/inventory/productsController');

router.get('/', controller.getAll);
router.get('/search', controller.search);
router.get('/export', controller.export);
router.get('/import-template', controller.getImportTemplate);
router.post('/import', controller.import);
router.get('/low-stock', controller.getLowStock);
router.get('/out-of-stock', controller.getOutOfStock);
router.get('/category/:categoryId', controller.getByCategory);
router.get('/supplier/:supplierId', controller.getBySupplier);
router.get('/sku/:sku', controller.getBySku);
router.get('/:id', controller.getOne);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);
router.patch('/:id/stock', controller.updateStock);
router.patch('/:id/status', controller.toggleStatus);

module.exports = router;
