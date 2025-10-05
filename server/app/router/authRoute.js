const express = require('express');
const passport = require('passport');
const AuthController = require('../controller/authController');
const authCheck = require('../middleware/authentication');
const router = express.Router();

router.post('/register', AuthController.register);
router.post('/request-dev-link', AuthController.requestDevLink);
router.post('/register-dev', AuthController.registerDev);
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  AuthController.googleCallback
);
router.get('/verify-email', AuthController.verifyEmail);
router.post('/resend-verification-mail', AuthController.resendVerificationMail);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);
router.post('/login', AuthController.login);
router.post('/logout', authCheck, AuthController.logout);

module.exports = router;