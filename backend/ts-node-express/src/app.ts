import express from 'express';
import { errorHandler } from './middlewares/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import 'dotenv/config.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import http from 'http'
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});
app.set('trust proxy', 1)
app.use(session({
  secret: process.env.SESSION_SECRET!,
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

app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

io.on('connection', (socket) => {
  console.log('connected to websocket')

  socket.on('connect-to-chat', (data) => {
    console.log('connecting to chat', data);
  })

  socket.emit('welcome', { 
    message: 'Connected to WebSocket server',
    socketId: socket.id 
  });

  socket.on('test', (data) => {
    console.log('Received test:', data);

    socket.emit('test-response', { 
      received: data,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('disconnect', () => {
    console.log('user disconnected')
  })
})

app.use('/api/auth', authRoutes);
app.use('/api/', userRoutes);
app.use('/api/documents/', documentRoutes);

app.use(errorHandler);

export { app, server, io };