import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const controller = new NotificationController();

router.get('/', authenticate, controller.findAll.bind(controller));
router.get('/unread', authenticate, controller.getUnread.bind(controller));
router.get('/:id', authenticate, controller.findById.bind(controller));
router.put('/:id/read', authenticate, controller.markAsRead.bind(controller));
router.put('/read-all', authenticate, controller.markAllAsRead.bind(controller));

export default router;