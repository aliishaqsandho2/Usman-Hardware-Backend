const express = require('express');
const router = express.Router();
const controller = require('../../controllers/expenses/allocationsController');

router.get('/', controller.getAll);
router.get('/payment/:paymentId', controller.getByPayment);
router.get('/invoice/:invoiceId', controller.getByInvoice);
router.get('/invoice-type/:type/:id', controller.getByInvoiceType);
router.get('/:id', controller.getOne);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

module.exports = router;
