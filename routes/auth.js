const express = require('express');
const router = express.Router();
const { login, logout, forgotPassword, resetPassword, changePassword } = require('../services/auth');
const { validateAuthentication } = require('../middlewares/auth');

router.post('/login', login);
router.post('/logout', validateAuthentication, logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.put('/change-password', validateAuthentication, changePassword);

module.exports = router;