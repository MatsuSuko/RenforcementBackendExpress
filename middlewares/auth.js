const jwt = require('jsonwebtoken');
const { User } = require('../models');
require('dotenv').config();

const validateAuthentication = (req, res, next) => {
    const authorizationHeader = req.header('authorization');
    const token = authorizationHeader?.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'No token provided' });

    jwt.verify(token, process.env.SECRET_KEY, async (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Wrong JWT token' });

        const user = await User.findOne({ where: { token } });

        if (!user) return res.status(403).json({ message: 'Session expired' });

        if (!user.active) return res.status(403).json({ message: 'Account disabled' });

        if (Date.now() >= (decoded.exp * 1000)) {
            user.token = null;
            await user.save();
            return res.status(403).json({ message: 'Token expired' });
        }

        req.user = user;
        next();
    });
};

module.exports = { validateAuthentication };