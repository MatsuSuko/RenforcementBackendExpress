const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST || 'mailhog',
    port: parseInt(process.env.MAIL_PORT) || 1025,
    secure: process.env.MAIL_SECURE === 'true',
    auth: process.env.MAIL_USER ? {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    } : undefined,
});

const sendMail = async ({ to, subject, text, html }) => {
    try {
        const info = await transporter.sendMail({
            from: process.env.MAIL_FROM || 'noreply@assurmoi.fr',
            to,
            subject,
            text,
            html
        });
        console.log('Mail envoyé :', info.messageId);
        return info;
    } catch (err) {
        console.error('Erreur envoi mail :', err.message);
        throw err;
    }
};

const sendResetPasswordMail = async (email, token) => {
    const resetUrl = `${process.env.APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    return sendMail({
        to: email,
        subject: 'Réinitialisation de votre mot de passe AssurMoi',
        text: `Cliquez sur ce lien pour réinitialiser votre mot de passe : ${resetUrl}\n\nCe lien expire dans 1 heure.`,
        html: `<p>Cliquez sur ce lien pour réinitialiser votre mot de passe :</p>
               <a href="${resetUrl}">${resetUrl}</a>
               <p>Ce lien expire dans 1 heure.</p>`
    });
};

const sendTwoFactorMail = async (email, code) => {
    return sendMail({
        to: email,
        subject: 'Votre code de connexion AssurMoi',
        text: `Votre code de vérification : ${code}\n\nCe code expire dans 10 minutes.`,
        html: `<p>Votre code de vérification :</p>
               <h2>${code}</h2>
               <p>Ce code expire dans 10 minutes.</p>`
    });
};

const sendNotificationMail = async (email, subject, message) => {
    return sendMail({
        to: email,
        subject,
        text: message,
        html: `<p>${message}</p>`
    });
};

module.exports = {
    sendMail,
    sendResetPasswordMail,
    sendTwoFactorMail,
    sendNotificationMail
};