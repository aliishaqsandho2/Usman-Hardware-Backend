const express = require('express');
const router = express.Router();
const controller = require('../../controllers/accounting/transactionsController');

router.get('/', controller.getAll);
router.get('/export', controller.exportTransactions);
router.get('/date/:date', controller.getByDate);
router.get('/range/:start/:end', controller.getByRange);
router.get('/type/:type', controller.getByType);
router.get('/reference/:type/:id', controller.getByReference);
router.post('/:id/reverse', controller.reverse);
router.get('/:id', controller.getOne);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

module.exports = router;
