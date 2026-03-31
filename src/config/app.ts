import 'dotenv/config';
import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from '../middleware/errorHandler';
import { notFoundHandler } from '../middleware/notFoundHandler';

// Routes
import authRoutes from '../routes/auth.routes';
import schoolRoutes from '../routes/school.routes';
import userRoutes from '../routes/user.routes';
import teacherRoutes from '../routes/teacher.routes';
import scheduleRoutes from '../routes/schedule.routes';
import substitutionRoutes from '../routes/substitution.routes';
import notificationRoutes from '../routes/notification.routes';
import uploadRoutes from '../routes/upload.routes';
import reportRoutes from '../routes/report.routes';

const app: Express = express();

// Middleware global
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rotas da API
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/schools', schoolRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/teachers', teacherRoutes);
app.use('/api/v1/schedules', scheduleRoutes);
app.use('/api/v1/substitutions', substitutionRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/reports', reportRoutes);

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;