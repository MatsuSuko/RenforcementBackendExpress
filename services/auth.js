const { User, dbInstance } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendResetPasswordMail, sendTwoFactorMail, sendLoginMail } = require('../utils/mailer');
require('dotenv').config();

// ── LOGIN ─────────────────────────────────────────────────────────────────────
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ where: { username } });
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (!user.active) return res.status(403).json({ message: 'Account disabled' });

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(401).json({ message: 'Incorrect password' });

        // Si 2FA activé, envoyer un code par mail
        if (user.two_step_code !== null) {
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            user.two_step_code = code;
            await user.save();
            await sendTwoFactorMail(user.email, code);
            return res.status(200).json({
                two_factor_required: true,
                user_id: user.id,
                message: 'Code envoyé par email'
            });
        }

        const token = jwt.sign({ user: user.clean() }, process.env.SECRET_KEY, { expiresIn: '24h' });
        user.token = token;
        await user.save();

        // Notification de connexion par mail (sans bloquer la réponse)
        sendLoginMail(user).catch(err => console.error('Mail login failed:', err.message));

        return res.status(200).json({ token });
    } catch (err) {
        return res.status(400).json({ message: 'Error on login' });
    }
};

// ── LOGOUT ────────────────────────────────────────────────────────────────────
const logout = async (req, res) => {
    req.user.token = null;
    await req.user.save();
    return res.status(200).json({ message: 'Logged out successfully' });
};

// ── FORGOT PASSWORD ───────────────────────────────────────────────────────────
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user) return res.status(200).json({ message: 'Si cet email existe, un lien a été envoyé' });

        const token = crypto.randomBytes(32).toString('hex');
        const expiration = new Date(Date.now() + 60 * 60 * 1000);

        user.reset_token = token;
        user.reset_token_expiration = expiration;
        await user.save();

        await sendResetPasswordMail(email, token);

        return res.status(200).json({ message: 'Si cet email existe, un lien a été envoyé' });
    } catch (err) {
        return res.status(500).json({ message: 'Erreur serveur' });
    }
};

// ── RESET PASSWORD ────────────────────────────────────────────────────────────
const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;

        const user = await User.findOne({ where: { reset_token: token } });
        if (!user) return res.status(400).json({ message: 'Token invalide' });

        if (new Date() > new Date(user.reset_token_expiration)) {
            return res.status(400).json({ message: 'Token expiré' });
        }

        user.password = await bcrypt.hash(password, parseInt(process.env.BCRYPT_SALT) || 10);
        user.reset_token = null;
        user.reset_token_expiration = null;
        await user.save();

        return res.status(200).json({ message: 'Mot de passe réinitialisé' });
    } catch (err) {
        return res.status(500).json({ message: 'Erreur serveur' });
    }
};

// ── CHANGE PASSWORD ───────────────────────────────────────────────────────────
const changePassword = async (req, res) => {
    try {
        const { current_password, new_password } = req.body;
        const match = await bcrypt.compare(current_password, req.user.password);
        if (!match) return res.status(401).json({ message: 'Mot de passe actuel incorrect' });

        req.user.password = await bcrypt.hash(new_password, parseInt(process.env.BCRYPT_SALT) || 10);
        await req.user.save();

        return res.status(200).json({ message: 'Mot de passe modifié' });
    } catch (err) {
        return res.status(500).json({ message: 'Erreur serveur' });
    }
};

// ── REGISTER ──────────────────────────────────────────────────────────────────
const register = async (req, res) => {
    const transaction = await require('../models').dbInstance.transaction();
    try {
        const { username, firstname, lastname, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Champs obligatoires manquants' });
        }

        const existing = await User.findOne({ where: { username } });
        if (existing) {
            return res.status(409).json({ message: 'Ce nom d\'utilisateur est déjà pris' });
        }

        const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_SALT) || 10);

        const user = await User.create({
            username,
            firstname: firstname || '',
            lastname: lastname || '',
            email,
            password: hashedPassword,
            role: 'insured',
            active: true,
        }, { transaction });

        await transaction.commit();

        const token = jwt.sign({ user: user.clean() }, process.env.SECRET_KEY, { expiresIn: '24h' });
        user.token = token;
        await user.save();

        return res.status(201).json({ token });
    } catch (err) {
        await transaction.rollback();
        return res.status(400).json({ message: 'Erreur lors de la création du compte' });
    }
};

module.exports = { login, logout, forgotPassword, resetPassword, changePassword, register };