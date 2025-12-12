const express = require('express');
const router = express.Router();
const controller = require('../../controllers/expenses/expensesController');

router.get('/', controller.getAll);
router.get('/summary', controller.getSummary);
router.get('/category/:category', controller.getByCategory);
router.get('/date/:date', controller.getByDate);
router.get('/range/:start/:end', controller.getByRange);
router.get('/method/:method', controller.getByMethod);
router.get('/user/:userId', controller.getByUser);
router.get('/:id', controller.getOne);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);
router.post('/:id/receipt', controller.uploadReceipt);

module.exports = router;
