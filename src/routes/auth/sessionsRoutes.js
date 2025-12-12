const express = require('express');
const router = express.Router();
const controller = require('../../controllers/auth/sessionsController');

router.get('/', controller.getSessions);
router.get('/:id', controller.getSession);
router.delete('/:id', controller.terminateSession);
router.delete('/user/:userId', controller.terminateUserSessions);
router.get('/user/:userId', controller.getUserSessions);

module.exports = router;
