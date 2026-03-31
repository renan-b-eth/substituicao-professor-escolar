import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@prisma/client';

const router = Router();
const controller = new UserController();

router.post('/', authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.SECRETARY), controller.create.bind(controller));
router.get('/', authenticate, controller.findAll.bind(controller));
router.get('/:id', authenticate, controller.findById.bind(controller));
router.put('/:id', authenticate, controller.update.bind(controller));
router.delete('/:id', authenticate, authorize(UserRole.SUPER_ADMIN), controller.delete.bind(controller));

export default router;