const express = require('express');
const router = express.Router();
const controller = require('../../controllers/accounting/profitSummaryController');

router.get('/', controller.getAll);
router.get('/report', controller.getReport);
router.get('/period/:date', controller.getByPeriodDate);
router.get('/type/:type', controller.getByType);
router.get('/range/:start/:end', controller.getByRange);
router.get('/:id', controller.getOne);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

module.exports = router;
