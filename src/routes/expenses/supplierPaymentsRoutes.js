const express = require('express');
const router = express.Router();
const controller = require('../../controllers/expenses/supplierPaymentsController');

router.get('/', controller.getAll);
router.get('/outstanding', controller.getOutstanding);
router.get('/supplier/:supplierId', controller.getBySupplier);
router.get('/:id', controller.getOne);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);
router.patch('/:id/status', controller.updateStatus);

module.exports = router;
