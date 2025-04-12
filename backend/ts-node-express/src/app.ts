import express from 'express';
// import itemRoutes from './routes/itemRoutes';
import { errorHandler } from './middlewares/errorHandler';
import authRoutes from './routes/authRoutes';
var cookieParser = require('cookie-parser')

const app = express();

app.use(express.json());

app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);

// Global error handler (should be after routes)
app.use(errorHandler);

export default app;