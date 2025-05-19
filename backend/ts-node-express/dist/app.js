"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const errorHandler_1 = require("./middlewares/errorHandler");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const documentRoutes_1 = __importDefault(require("./routes/documentRoutes"));
require("dotenv/config");
var cors = require('cors');
var cookieParser = require('cookie-parser');
var session = require('express-session');
const app = (0, express_1.default)();
app.set('trust proxy', 1);
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
}));
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['x-new-token'],
    credentials: true
}));
app.use(express_1.default.json({ limit: '50mb' }));
app.use(cookieParser());
app.use(express_1.default.urlencoded({ extended: true, limit: '50mb' }));
app.use('/api/auth', authRoutes_1.default);
app.use('/api/', userRoutes_1.default);
app.use('/api/documents/', documentRoutes_1.default);
app.use(errorHandler_1.errorHandler);
exports.default = app;
