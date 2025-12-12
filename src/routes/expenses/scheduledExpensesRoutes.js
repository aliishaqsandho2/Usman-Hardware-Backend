const express = require('express');
const router = express.Router();
const controller = require('../../controllers/expenses/scheduledExpensesController');

router.get('/', controller.getAll);
router.get('/upcoming', controller.getUpcoming);
router.get('/status/:status', controller.getByStatus);
router.get('/frequency/:frequency', controller.getByFrequency);
router.get('/:id', controller.getOne);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);
router.patch('/:id/status', controller.updateStatus);
router.post('/:id/execute', controller.execute);

module.exports = router;
