const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { User, dbInstance } = require('../models');

// Config mailer (Mailhog en dev)
const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST || 'mailhog',
    port: process.env.MAIL_PORT || 1025,
    secure: false
});

// ─── LOGIN ────────────────────────────────────────────────────────────────────
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Username et mot de passe requis' });
        }

        const user = await User.findOne({ where: { username } });

        if (!user) {
            return res.status(401).json({ message: 'Identifiants incorrects' });
        }

        if (!user.actif) {
            return res.status(403).json({ message: 'Compte désactivé' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Identifiants incorrects' });
        }

        // Si 2FA activé, on envoie un code et on ne renvoie pas encore le token
        if (user.deux_facteurs_actif) {
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            const expiration = new Date(Date.now() + 10 * 60 * 1000); // 10 min

            await User.update(
                { deux_facteurs_code: code, deux_facteurs_expiration: expiration },
                { where: { id: user.id } }
            );

            await transporter.sendMail({
                from: 'noreply@assurmoi.fr',
                to: user.email,
                subject: 'Votre code de connexion AssurMoi',
                text: `Votre code de vérification : ${code} (valable 10 minutes)`
            });

            return res.status(200).json({
                deux_facteurs_requis: true,
                user_id: user.id,
                message: 'Code envoyé par email'
            });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        return res.status(200).json({
            token,
            user: {
                id: user.id,
                username: user.username,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        return res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
};

// ─── VÉRIFICATION CODE 2FA ────────────────────────────────────────────────────
const verify2FA = async (req, res) => {
    try {
        const { user_id, code } = req.body;

        const user = await User.findOne({ where: { id: user_id } });

        if (!user) {
            return res.status(404).json({ message: 'Utilisateur introuvable' });
        }

        if (!user.actif) {
            return res.status(403).json({ message: 'Compte désactivé' });
        }

        if (user.deux_facteurs_code !== code) {
            return res.status(401).json({ message: 'Code incorrect' });
        }

        if (new Date() > new Date(user.deux_facteurs_expiration)) {
            return res.status(401).json({ message: 'Code expiré' });
        }

        // Invalider le code après utilisation
        await User.update(
            { deux_facteurs_code: null, deux_facteurs_expiration: null },
            { where: { id: user.id } }
        );

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        return res.status(200).json({
            token,
            user: {
                id: user.id,
                username: user.username,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        return res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
};

// ─── DEMANDE DE RÉINITIALISATION MOT DE PASSE ─────────────────────────────────
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ where: { email } });

        // On répond toujours OK pour ne pas révéler si l'email existe
        if (!user) {
            return res.status(200).json({ message: 'Si cet email existe, un lien a été envoyé' });
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expiration = new Date(Date.now() + 60 * 60 * 1000); // 1h

        await User.update(
            { reset_token: token, reset_token_expiration: expiration },
            { where: { id: user.id } }
        );

        const resetUrl = `${process.env.APP_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`;

        await transporter.sendMail({
            from: 'noreply@assurmoi.fr',
            to: user.email,
            subject: 'Réinitialisation de votre mot de passe AssurMoi',
            text: `Cliquez sur ce lien pour réinitialiser votre mot de passe : ${resetUrl}\n\nCe lien expire dans 1 heure.`
        });

        return res.status(200).json({ message: 'Si cet email existe, un lien a été envoyé' });
    } catch (err) {
        return res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
};

// ─── RÉINITIALISATION MOT DE PASSE ───────────────────────────────────────────
const resetPassword = async (req, res) => {
    const transaction = await dbInstance.transaction();
    try {
        const { token, password } = req.body;

        if (!token || !password) {
            return res.status(400).json({ message: 'Token et nouveau mot de passe requis' });
        }

        const user = await User.findOne({ where: { reset_token: token } });

        if (!user) {
            return res.status(400).json({ message: 'Token invalide' });
        }

        if (new Date() > new Date(user.reset_token_expiration)) {
            return res.status(400).json({ message: 'Token expiré' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.update(
            {
                password: hashedPassword,
                reset_token: null,
                reset_token_expiration: null
            },
            { where: { id: user.id }, transaction }
        );

        await transaction.commit();
        return res.status(200).json({ message: 'Mot de passe réinitialisé avec succès' });
    } catch (err) {
        await transaction.rollback();
        return res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
};

// ─── MOT DE PASSE COURANT ─────────────────────────────────────────────────────
const changePassword = async (req, res) => {
    const transaction = await dbInstance.transaction();
    try {
        const { current_password, new_password } = req.body;

        const user = await User.findOne({ where: { id: req.user.id } });

        const match = await bcrypt.compare(current_password, user.password);
        if (!match) {
            return res.status(401).json({ message: 'Mot de passe actuel incorrect' });
        }

        const hashedPassword = await bcrypt.hash(new_password, 10);

        await User.update(
            { password: hashedPassword },
            { where: { id: user.id }, transaction }
        );

        await transaction.commit();
        return res.status(200).json({ message: 'Mot de passe modifié avec succès' });
    } catch (err) {
        await transaction.rollback();
        return res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
};

module.exports = { login, verify2FA, forgotPassword, resetPassword, changePassword };