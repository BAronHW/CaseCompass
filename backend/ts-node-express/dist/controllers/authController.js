"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.refresh = exports.loginUser = exports.registerUser = exports.protectedRoute = void 0;
const prismaContext_js_1 = require("../lib/prismaContext.js");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
require("dotenv/config.js");
/**
 * TODO:
 * 1. refactor to use transactions to ensure atomic mutations\
 * 2. refactor so that instead of using refresh-tokens in cookies
 */
const protectedRoute = (req, res) => {
    res.json({ message: "welcome to protected route" });
    return;
};
exports.protectedRoute = protectedRoute;
const registerUser = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        const userHasExists = await prismaContext_js_1.db.user.findFirst({
            where: {
                email: email
            }
        });
        if (userHasExists) {
            res.status(400).send('This user already exists!');
            return;
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const uuid = crypto_1.default.randomUUID();
        const newUser = await prismaContext_js_1.db.user.create({
            data: {
                name: name,
                email: email,
                password: hashedPassword,
                uid: uuid,
                refreshToken: ''
            }
        });
        await prismaContext_js_1.db.accountTemplate.create({
            data: {
                ownerId: newUser.id
            }
        });
        const returnNewUser = {
            name: name,
            email: email,
            uuid: uuid
        };
        res.status(201).json({
            message: 'User registered',
            newUser: returnNewUser
        });
        return;
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
        return;
    }
};
exports.registerUser = registerUser;
const loginUser = async (req, res, next) => {
    try {
        const user = await prismaContext_js_1.db.user.findUnique({
            where: {
                email: req.body.email
            }
        });
        if (!user) {
            res.status(401).json({ message: 'This user does not exist please register or the credentials you have entered are wrong' });
            return;
        }
        const passwordMatch = await bcryptjs_1.default.compare(req.body.password, user.password);
        if (!passwordMatch) {
            res.status(401).json({ message: 'invalid credentials' });
            return;
        }
        const userForToken = {
            id: user.id,
            email: user.email
        };
        const jwtSecret = process.env.JWT_SECRET;
        const accessToken = jsonwebtoken_1.default.sign({ userForToken }, jwtSecret, { expiresIn: '1h' });
        const refreshToken = jsonwebtoken_1.default.sign({ userForToken }, jwtSecret, { expiresIn: '1d' });
        const returnUser = {
            name: user.name,
            email: user.email,
            uid: user.uid,
            accessToken
        };
        await prismaContext_js_1.db.user.update({
            where: {
                email: req.body.email
            },
            data: {
                refreshToken: refreshToken
            }
        });
        res
            .cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 60 * 60 * 1000 })
            .header('Authorization', accessToken)
            .json({ user: returnUser });
        return;
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.loginUser = loginUser;
const refresh = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            res.status(400).json({ message: "missing refresh token" });
            return;
        }
        const jwtSecret = process.env.JWT_SECRET;
        const isValidRefreshToken = jsonwebtoken_1.default.verify(refreshToken, jwtSecret);
        if (!isValidRefreshToken) {
            res.status(400).json({ message: "invalid refresh token" });
            return;
        }
        // @ts-ignore
        const user = isValidRefreshToken.userForToken;
        const newAccessToken = jsonwebtoken_1.default.sign({ user }, jwtSecret, { expiresIn: '1h' });
        res.status(200).json({ newAccessToken });
        return;
    }
    catch (error) {
        console.log(error);
        res.status(400).json({ error });
        return;
    }
};
exports.refresh = refresh;
const logout = (req, res, next) => {
    try {
        res.removeHeader('Authorization');
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });
        res.status(200).json({ message: 'Successfully logged out' });
        return;
    }
    catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'Error during logout process' });
        return;
    }
};
exports.logout = logout;
