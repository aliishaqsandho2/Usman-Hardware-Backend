const express = require('express');
const router = express.Router();
const controller = require('../../controllers/hr/employeesController');

router.get('/', controller.getAll);
router.get('/search', controller.search);
router.get('/export', controller.export);
router.get('/status/:status', controller.getByStatus);
router.get('/:id', controller.getOne);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);
router.patch('/:id/status', controller.toggleStatus);
router.patch('/:id/salary', controller.updateSalary);

module.exports = router;
