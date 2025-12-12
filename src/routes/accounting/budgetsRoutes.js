const express = require('express');
const router = express.Router();
const controller = require('../../controllers/accounting/budgetsController');

router.get('/', controller.getAll);
router.get('/variance-report', controller.getVarianceReport);
router.get('/year/:year', controller.getByYear);
router.get('/month/:year/:month', controller.getByMonth);
router.get('/category/:category', controller.getByCategory);
router.get('/:id', controller.getOne);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);
router.patch('/:id/amount', controller.updateActual);

module.exports = router;
