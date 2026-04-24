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

// ── Mail de notification connexion ────────────────────────────────────────────
const sendLoginMail = async (user) => {
    const now = new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });
    return sendMail({
        to: user.email,
        subject: '🔐 Nouvelle connexion à votre compte AssurMoi',
        text: `Bonjour ${user.firstname || user.username},\n\nUne connexion a été détectée sur votre compte AssurMoi le ${now}.\n\nSi ce n'était pas vous, changez immédiatement votre mot de passe.`,
        html: `
            <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto">
                <h2 style="color:#0D47A1">🔐 Nouvelle connexion détectée</h2>
                <p>Bonjour <strong>${user.firstname || user.username}</strong>,</p>
                <p>Une connexion a été détectée sur votre compte <strong>AssurMoi</strong> le <strong>${now}</strong>.</p>
                <p style="color:#B91C1C">Si ce n'était pas vous, changez immédiatement votre mot de passe.</p>
                <hr style="border:1px solid #E2E8F0">
                <p style="font-size:12px;color:#94A3B8">AssurMoi — Gestion des sinistres</p>
            </div>`
    });
};

// ── Mail demande de documents sinistre ────────────────────────────────────────
const sendDocumentRequestMail = async (user, sinistre, typesDocuments) => {
    const types = typesDocuments.join(', ');
    return sendMail({
        to: user.email,
        subject: `📄 Documents requis — Sinistre ${sinistre.immatriculation}`,
        text: `Bonjour ${user.firstname || user.username},\n\nDes documents sont requis pour votre sinistre concernant le véhicule ${sinistre.immatriculation}.\n\nDocuments demandés : ${types}\n\nMerci de les transmettre dès que possible.`,
        html: `
            <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto">
                <h2 style="color:#0D47A1">📄 Documents requis</h2>
                <p>Bonjour <strong>${user.firstname || user.username}</strong>,</p>
                <p>Des documents sont requis pour votre sinistre concernant le véhicule <strong>${sinistre.immatriculation}</strong>.</p>
                <div style="background:#F0F4FF;padding:16px;border-radius:8px;margin:16px 0">
                    <strong>Documents demandés :</strong><br>${typesDocuments.map(t => `• ${t}`).join('<br>')}
                </div>
                <p>Merci de les transmettre dès que possible via l'application AssurMoi.</p>
                <hr style="border:1px solid #E2E8F0">
                <p style="font-size:12px;color:#94A3B8">AssurMoi — Gestion des sinistres</p>
            </div>`
    });
};

// ── Mail demande de RIB ───────────────────────────────────────────────────────
const sendRibRequestMail = async (user, sinistre) => {
    return sendMail({
        to: user.email,
        subject: `🏦 RIB requis — Sinistre ${sinistre.immatriculation}`,
        text: `Bonjour ${user.firstname || user.username},\n\nAfin de procéder au règlement de votre sinistre (véhicule : ${sinistre.immatriculation}), nous avons besoin de votre RIB.\n\nMerci de le transmettre dès que possible.`,
        html: `
            <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto">
                <h2 style="color:#0D47A1">🏦 RIB requis</h2>
                <p>Bonjour <strong>${user.firstname || user.username}</strong>,</p>
                <p>Afin de procéder au règlement de votre sinistre concernant le véhicule <strong>${sinistre.immatriculation}</strong>, nous avons besoin de votre <strong>RIB (Relevé d'Identité Bancaire)</strong>.</p>
                <p>Merci de le transmettre dès que possible via l'application AssurMoi.</p>
                <hr style="border:1px solid #E2E8F0">
                <p style="font-size:12px;color:#94A3B8">AssurMoi — Gestion des sinistres</p>
            </div>`
    });
};

module.exports = {
    sendMail,
    sendResetPasswordMail,
    sendTwoFactorMail,
    sendNotificationMail,
    sendLoginMail,
    sendDocumentRequestMail,
    sendRibRequestMail,
};