const express = require('express');
const router = express.Router();
const controller = require('../../controllers/inventory/categoriesController');

router.get('/', controller.getAll);
router.get('/search', controller.search);
router.get('/products/:categoryId', controller.getCategoryProducts);
router.get('/:id', controller.getOne);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

module.exports = router;
