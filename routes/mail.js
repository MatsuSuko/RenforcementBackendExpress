const express = require('express');
const router = express.Router();
const { sendMail } = require('../utils/mailer');

/**
 * @swagger
 * /mail/test:
 *   post:
 *     summary: Envoyer un mail de test
 *     tags: [Mail]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - to
 *             properties:
 *               to:
 *                 type: string
 *                 example: test@example.com
 *               subject:
 *                 type: string
 *                 example: Test AssurMoi
 *               message:
 *                 type: string
 *                 example: Ceci est un mail de test.
 *     responses:
 *       200:
 *         description: Mail envoyé avec succès
 *       400:
 *         description: Destinataire manquant
 *       500:
 *         description: Erreur lors de l'envoi
 */
router.post('/mail/test', async (req, res) => {
    const { to, subject, message } = req.body;

    if (!to) {
        return res.status(400).json({ message: 'Le champ "to" est requis' });
    }

    try {
        await sendMail({
            to,
            subject: subject || 'Mail de test AssurMoi',
            text: message || 'Ceci est un mail de test envoyé depuis AssurMoi.',
            html: `<p>${message || 'Ceci est un mail de test envoyé depuis <strong>AssurMoi</strong>.'}</p>`,
        });

        return res.status(200).json({ message: `Mail envoyé à ${to}` });
    } catch (err) {
        return res.status(500).json({ message: "Erreur lors de l'envoi du mail", error: err.message });
    }
});

module.exports = router;
