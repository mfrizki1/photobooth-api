const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

const { registerValidation, loginValidation, validate } = require('../middleware/validator');

// Apply validation middleware to routes
router.post('/register', registerValidation, validate, authController.register);
router.post('/login', loginValidation, validate, authController.login);
router.delete('/user/:id', authController.deleteAccount);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/refresh-token', authController.refreshToken);
router.put('/profile/:id', authController.updateProfile);

module.exports = router;