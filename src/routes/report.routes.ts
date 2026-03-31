import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const controller = new ReportController();

// Relatório de substituições do dia (PDF)
router.get('/daily-substitutions/pdf', authenticate, controller.generateDailyReport.bind(controller));

// Relatório de substituições por período
router.get('/substitutions', authenticate, controller.getSubstitutionsReport.bind(controller));

// Estatísticas do dashboard
router.get('/dashboard/stats', authenticate, controller.getDashboardStats.bind(controller));

export default router;