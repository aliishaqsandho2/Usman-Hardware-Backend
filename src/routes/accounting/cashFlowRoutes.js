const express = require('express');
const router = express.Router();
const controller = require('../../controllers/accounting/cashFlowController');

router.get('/', controller.getAll);
router.get('/summary', controller.getSummary);
router.get('/type/:type', controller.getByType);
router.get('/date/:date', controller.getByDate);
router.get('/range/:start/:end', controller.getByRange);
router.get('/account/:id', controller.getByAccount);
router.get('/:id', controller.getOne);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

module.exports = router;
