const express = require('express');
const router = express.Router();
const controller = require('../../controllers/parties/externalPurchasesController.js');

router.get('/', controller.getAll);
router.get('/sale/:saleId', controller.getBySale);
router.get('/:id', controller.getOne);
router.post('/', controller.create);
router.delete('/:id', controller.delete);

module.exports = router;
