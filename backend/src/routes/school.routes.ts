import { Router } from 'express';
import { SchoolController } from '../controllers/school.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/auth';
import { UserRole } from '@prisma/client';

const router = Router();
const controller = new SchoolController();

// Routes (apenas Super Admin pode criar/eseditar escolas)
router.post('/', authenticate, authorize(UserRole.SUPER_ADMIN), controller.create.bind(controller));
router.get('/', authenticate, controller.findAll.bind(controller));
router.get('/:id', authenticate, controller.findById.bind(controller));
router.put('/:id', authenticate, authorize(UserRole.SUPER_ADMIN), controller.update.bind(controller));
router.delete('/:id', authenticate, authorize(UserRole.SUPER_ADMIN), controller.delete.bind(controller));

export default router;