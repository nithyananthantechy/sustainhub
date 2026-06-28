import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/error';

// Import routes
import authRoutes from './routes/authRoutes';
import companyRoutes from './routes/companyRoutes';
import metricRoutes from './routes/metricRoutes';
import statRoutes from './routes/statRoutes';
import ticketRoutes from './routes/ticketRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import complianceRoutes from './routes/complianceRoutes';
import riskRoutes from './routes/riskRoutes';
import circularRoutes from './routes/circularRoutes';
import economicRoutes from './routes/economicRoutes';
import grievanceRoutes from './routes/grievanceRoutes';

const app = express();

// Security Middlewares
app.use(helmet());

// CORS Configuration
app.use(
  cors({
    origin: true, // Reflects the requesting origin (fixes all Vercel/GoDaddy CORS issues)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-KEY'],
    credentials: true,
  })
);

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiters
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 auth requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts, please try again later.' },
});

// Apply general rate limiting
app.use('/api/', generalLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// Mount Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/csr-metrics', metricRoutes);
app.use('/api/stats', statRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/risk', riskRoutes);
app.use('/api/circular', circularRoutes);
app.use('/api/economic', economicRoutes);
app.use('/api/grievance', grievanceRoutes);

// Global Error Handler Middleware
app.use(errorHandler);

export default app;
