import express from 'express';
// import itemRoutes from './routes/itemRoutes';
import { errorHandler } from './middlewares/errorHandler';
import authRoutes from './routes/authRoutes';

const app = express();

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Global error handler (should be after routes)
app.use(errorHandler);

export default app;