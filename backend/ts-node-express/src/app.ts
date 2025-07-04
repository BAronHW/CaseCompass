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
import { db } from './lib/prismaContext.js';
import { GenerateContentResponse, GoogleGenAI } from "@google/genai";

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

    const userId = socket.data?.userId || socket.handshake.query.userId;
    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI });

  socket.on('connect-to-chat-room', async ({ userId, action }) => {
    try {

      let chatRoom;
      
      if (action === 'create') {
        chatRoom = await db.chat.create({
          data: {
            userId: userId
          }
        })
      }

      else if (action === 'join') {
        chatRoom = await db.chat.findUnique({
          where: {
            userId: userId
          }
        })
      }

      socket.emit('chat-created', {
        message: 'Chat room created successfully',
        chatRoom: chatRoom
      });

    } catch (error) {
      console.log('error with connect-tochat-room', error)
    }
  })


  socket.on('send-message', async ({ chatRoomId, messageBody }) => {
    try {

      const chatRoom = await db.chat.findUnique({
        where: {
          id: chatRoomId
        }
      })

      if (!chatRoom) {
        console.log('error finding existing chatroom in sending message');
      }

      const newMessage = await db.message.create({
        data: {
          chatId: chatRoom!.id,
          body: messageBody,
          role: 'user',
          isHuman: true
        }
      })

      if (!newMessage) {
        console.log('error creating new message in the database');
      }

      socket.emit('new-human-message', {
        message: 'New message sent successfully',
        newMessage: newMessage
      })

      const generateLlmmResponse = async (body: string): Promise<GenerateContentResponse> => {
        const response = await genAI.models.generateContent({
          model: 'gemini-2.0-flash-001',
          contents: messageBody,
        });
        return response;
      }

      const llmResp = await generateLlmmResponse(messageBody);

      const newLlmResponse = await db.message.create({
        data: {
          chatId: chatRoomId,
          role: 'llm',
          body: llmResp.text,
          isHuman: false
        }
      })

      socket.emit('new-llm-response', {
        message: 'New Llm Message sent successfully',
        newLlmMessage: newLlmResponse
      })

    } catch (error) {
      console.log('error with sednign message', error)
    }
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