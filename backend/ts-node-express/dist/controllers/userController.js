"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findAllUsers = exports.findUserByUid = void 0;
const prismaContext_js_1 = require("../lib/prismaContext.js");
const findUserByUid = async (req, res, next) => {
    try {
        const uuid = req.params.uuid;
        if (!uuid) {
            res.status(400).json({
                message: 'no uuid in param'
            });
        }
        ;
        const user = await prismaContext_js_1.db.user.findUnique({
            where: {
                uid: uuid
            }
        });
        if (!user) {
            res.status(400).json({
                message: 'unable to find user with this uuid'
            });
        }
        const { password, ...serializedUser } = user;
        res.status(200).json({
            user: serializedUser
        });
    }
    catch (error) {
        res.status(400).json({ error });
    }
};
exports.findUserByUid = findUserByUid;
const findAllUsers = async (req, res, next) => {
    try {
        const allUsers = await prismaContext_js_1.db.user.findMany();
        const allUsersSerialized = allUsers.map((user) => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });
        res.status(200).json({
            allUsersSerialized
        });
    }
    catch (error) {
        res.status(400).json({
            error
        });
    }
};
exports.findAllUsers = findAllUsers;
