import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler.js';

// Import Routes
import searchRoutes from './routes/search.js';
import leadsRoutes from './routes/leads.js';
import historyRoutes from './routes/history.js';
import usersRoutes from './routes/users.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173'
}));
app.use(express.json());

// Routes
app.use('/api/search', searchRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/users', usersRoutes);

// Global Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
