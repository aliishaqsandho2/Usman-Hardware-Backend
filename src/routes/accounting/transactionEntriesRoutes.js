const express = require('express');
const router = express.Router();
const controller = require('../../controllers/accounting/transactionEntriesController.js');

router.get('/', controller.getAll);
router.get('/transaction/:id', controller.getByTransaction);
router.get('/account/:id', controller.getByAccount);
router.post('/', controller.create);
router.delete('/:id', controller.delete);

module.exports = router;
