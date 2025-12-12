const express = require('express');
const router = express.Router();
const controller = require('../../controllers/parties/suppliersController');

router.get('/', controller.getAll);
router.get('/search', controller.search);
router.get('/status/:status', controller.getByStatus);
router.get('/:id/outstanding', controller.getOutstanding);
router.get('/:id/products', controller.getProducts);
router.get('/:id', controller.getOne);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);
router.patch('/:id/status', controller.toggleStatus);

module.exports = router;
