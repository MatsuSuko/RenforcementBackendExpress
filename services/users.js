const { Op } = require('sequelize');
const { User, dbInstance } = require('../models');
const bcrypt = require('bcrypt');
require('dotenv').config();

const getAllUsers = async (req, res) => {
    let queryParam = {};
    if (req.query?.search) {
        queryParam = {
            where: {
                firstname: {
                    [Op.like]: `%${req.query.search}%`
                }
            }
        };
    }
    const users = await User.findAll(queryParam);
    res.status(200).json({ users });
};

const getUser = async (req, res) => {
    const id = req.params.id;
    const user = await User.findOne({ where: { id } });
    res.status(200).json({ user });
};

const createUser = async (req, res) => {
    const transaction = await dbInstance.transaction();
    try {
        const { username, firstname, lastname, email, password, role } = req.body;
        const hashedpassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_SALT));

        const user = await User.create({
            username,
            firstname,
            lastname,
            email,
            password: hashedpassword,
            role: role || 'insured'
        }, { transaction });

        await transaction.commit();
        return res.status(201).json({
            user: user.clean()
        });
    } catch (err) {
        await transaction.rollback();
        return res.status(400).json({
            message: 'Error on user creation',
            stacktrace: err.errors
        });
    }
};

const updateUser = async (req, res) => {
    const transaction = await dbInstance.transaction();
    try {
        const { username, firstname, lastname, email, role, active } = req.body;
        const user_id = req.params.id;

        await User.update({
            username,
            firstname,
            lastname,
            email,
            role,
            active
        }, {
            where: { id: user_id },
            transaction
        });

        await transaction.commit();
        return res.status(200).json({
            message: 'Successfuly updated'
        });
    } catch (err) {
        await transaction.rollback();
        return res.status(400).json({
            message: 'Error on user update',
            stacktrace: err.errors
        });
    }
};

const deleteUser = async (req, res) => {
    const transaction = await dbInstance.transaction();
    try {
        const user_id = req.params.id;

        const status = await User.destroy({
            where: { id: user_id },
            transaction
        });

        await transaction.commit();
        return res.status(200).json({
            message: 'Successfuly deleted',
            status
        });
    } catch (err) {
        await transaction.rollback();
        return res.status(400).json({
            message: 'Error on user deletion',
            stacktrace: err.errors
        });
    }
};

module.exports = {
    getAllUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser
};