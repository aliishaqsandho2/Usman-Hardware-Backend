const express = require('express');
const router = express.Router();
const authController = require('../../controllers/auth/authController');

const authMiddleware = require('../../middleware/authMiddleware');

router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/refresh-token', authController.refreshToken);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Protected Routes
router.post('/logout', authMiddleware, authController.logout);
router.post('/change-password', authMiddleware, authController.changePassword);
router.get('/me', authMiddleware, authController.getMe);
router.put('/profile', authMiddleware, authController.updateProfile);

module.exports = router;
