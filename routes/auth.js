const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/auth');
const {
    login,
    verify2FA,
    forgotPassword,
    resetPassword,
    changePassword
} = require('../services/auth');

router.post('/login', login);
router.post('/2fa/verify', verify2FA);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.put('/change-password', authMiddleware, changePassword);

module.exports = router;