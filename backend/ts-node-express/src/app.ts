import express from 'express';
import { errorHandler } from './middlewares/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import tagRoutes from './routes/tagRoutes.js';
import 'dotenv/config.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import cookieSession from 'cookie-session';
import http from 'http'
import { Server } from 'socket.io';
import { websocketService } from './socket/service/WebsocketService.js';
import chatRoutes from './routes/chatRoutes.js';
// TODO: create a more sophisticated rag system do research
const app = express();
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  transports: ['websocket', 'polling'], // if the websocket fails default to polling 
  allowEIO3: true
});

app.set('trust proxy', 1)

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type'],
    exposedHeaders: ['x-new-token'],
    credentials: true
  }));

app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
websocketService();

app.use('/api/auth', authRoutes);
app.use('/api/', userRoutes);
app.use('/api/documents/', documentRoutes);
app.use('/api/chat/', chatRoutes);
app.use('/api/tag', tagRoutes);

app.use(errorHandler);

export { app, server, io };