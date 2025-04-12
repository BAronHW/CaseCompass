import express from 'express';
import { errorHandler } from './middlewares/errorHandler';
import authRoutes from './routes/authRoutes';
var cookieParser = require('cookie-parser')

const app = express();

app.use(express.json());

app.use(cookieParser());

app.use('/api/auth', authRoutes);

app.use(errorHandler);

export default app;