const express = require('express');
const router = express.Router();
const controller = require('../../controllers/expenses/paymentsController');

router.get('/', controller.getAll);
router.get('/unallocated', controller.getUnallocated);
router.get('/customer/:customerId', controller.getByCustomer);
router.get('/date/:date', controller.getByDate);
router.get('/type/:type', controller.getByType);
router.get('/method/:method', controller.getByMethod);
router.get('/status/:status', controller.getByStatus);
router.get('/reference/:reference', controller.getByReference);
router.get('/:id', controller.getOne);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);
router.patch('/:id/status', controller.updateStatus);
router.post('/:id/allocate', controller.allocate);

module.exports = router;
