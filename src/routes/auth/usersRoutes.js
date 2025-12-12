const express = require('express');
const router = express.Router();
const usersController = require('../../controllers/auth/usersController');

router.get('/', usersController.getUsers);
router.get('/search', usersController.searchUsers); // Place before :id to avoid conflict
router.get('/export', usersController.exportUsers);
router.get('/roles/:role', usersController.getUsersByRole);
router.get('/:id', usersController.getUser);
router.post('/', usersController.createUser);
router.put('/:id', usersController.updateUser);
router.delete('/:id', usersController.deleteUser);
router.patch('/:id/status', usersController.toggleStatus);
router.patch('/:id/role', usersController.changeRole);
router.post('/:id/permissions', usersController.updatePermissions);
router.post('/:id/avatar', usersController.uploadAvatar);
router.post('/:id/reset-password', usersController.adminResetPassword);

module.exports = router;
