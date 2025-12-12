const express = require('express');
const router = express.Router();
const controller = require('../../controllers/scheduling/notificationsController');

router.get('/', controller.getAll);
router.get('/unread', controller.getUnread);
router.patch('/read-all', controller.markAllRead);
router.patch('/:id/read', controller.markRead);
router.get('/type/:type', controller.getByType);
router.get('/related/:type/:id', controller.getByRelated);
router.get('/:id', controller.getOne);
router.post('/', controller.create);
router.delete('/:id', controller.delete);

module.exports = router;
