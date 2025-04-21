import express from 'express';
import { errorHandler } from './middlewares/errorHandler';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import documentRoutes from './routes/documentRoutes';
var cors = require('cors');
var cookieParser = require('cookie-parser')

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());
app.use(cors({
    credentials: 'include',
}));

app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/', userRoutes);
app.use('/api/documents/', documentRoutes);

app.use(errorHandler);

export default app;