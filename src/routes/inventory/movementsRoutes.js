const express = require('express');
const router = express.Router();
const controller = require('../../controllers/inventory/movementsController');

router.get('/', controller.getAll);
router.post('/', controller.recordMovement);
router.post('/adjust', controller.adjustStock);
router.get('/report', controller.generateReport);
router.get('/product/:productId', controller.getByProduct);
router.get('/type/:type', controller.getByType);
router.get('/date/:date', controller.getByDate);
router.get('/range/:start/:end', controller.getByRange);
router.get('/:id', controller.getOne);

module.exports = router;
