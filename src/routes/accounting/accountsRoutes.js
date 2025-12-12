const express = require('express');
const router = express.Router();
const controller = require('../../controllers/accounting/accountsController');

router.get('/', controller.getAll);
router.get('/summary', controller.getSummary);
router.get('/type/:type', controller.getByType);
router.get('/code/:code', controller.getByCode);
router.get('/balance/:id', controller.getBalance);
router.get('/:id', controller.getOne);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);
router.patch('/:id/status', controller.toggleStatus);

module.exports = router;