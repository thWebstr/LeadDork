import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/errorHandler.js';

// Import Routes
import searchRoutes from './routes/search.js';
import leadsRoutes from './routes/leads.js';
import historyRoutes from './routes/history.js';
import usersRoutes from './routes/users.js';
import authRoutes from './routes/auth.js';
import { authenticateToken } from './middleware/authMiddleware.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware (Disabled helmet for connectivity troubleshooting)
// app.use(helmet()); 
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173'
}));
app.use(express.json());

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is reachable' });
});

// Rate Limiting — 100 requests per 15 minutes for general API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, error: 'Too many requests, please try again later.' }
});

// Stricter limiter for expensive search/scrape endpoints
const searchLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 20, // 20 scrapes per hour to protect SerpApi costs
  message: { success: false, error: 'Daily scraping limit reached. Please wait an hour.' }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/search', authenticateToken, searchLimiter, searchRoutes);
app.use('/api/leads', authenticateToken, apiLimiter, leadsRoutes);
app.use('/api/history', authenticateToken, apiLimiter, historyRoutes);
app.use('/api/users', authenticateToken, apiLimiter, usersRoutes);

// Global Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
