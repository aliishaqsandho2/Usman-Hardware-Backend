const express = require('express');
const router = express.Router();
const controller = require('../../controllers/parties/outsourcingOrdersController');

router.get('/', controller.getAll);
router.get('/sale/:saleId', controller.getBySale);
router.get('/supplier/:supplierId', controller.getBySupplier);
router.get('/status/:status', controller.getByStatus);
router.get('/:id', controller.getOne);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);
router.patch('/:id/status', controller.updateStatus);

module.exports = router;
