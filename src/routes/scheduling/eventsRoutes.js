const express = require('express');
const router = express.Router();
const controller = require('../../controllers/scheduling/eventsController');

router.get('/', controller.getAll);
router.get('/upcoming', controller.getUpcoming);
router.get('/today', controller.getToday);
router.get('/date/:date', controller.getByDate);
router.get('/range/:start/:end', controller.getByRange);
router.get('/type/:type', controller.getByType);
router.get('/customer/:customerId', controller.getByCustomer);
router.get('/priority/:priority', controller.getByPriority);
router.get('/status/:status', controller.getByStatus);
router.get('/:id', controller.getOne);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);
router.patch('/:id/status', controller.updateStatus);

module.exports = router;
