import { Router } from 'express';
import { SubstitutionController } from '../controllers/substitution.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@prisma/client';

const router = Router();
const controller = new SubstitutionController();

// Routes principais do fluxo de substituição
router.post('/', authenticate, authorize(UserRole.INSPECTOR), controller.create.bind(controller));
router.get('/', authenticate, controller.findAll.bind(controller));
router.get('/today', authenticate, controller.getTodaySubstitutions.bind(controller));
router.get('/pending-goe', authenticate, authorize(UserRole.GOE), controller.getPendingGOE.bind(controller));
router.get('/:id', authenticate, controller.findById.bind(controller));

// PASSO 1: Inspetora confirma legitimidade da troca
router.post('/:id/confirm-legitimacy', authenticate, authorize(UserRole.INSPECTOR), controller.confirmLegitimacy.bind(controller));

// PASSO 2: Change status to PENDING_GOE (after confirming legitimacy)
router.post('/:id/submit-goe', authenticate, authorize(UserRole.INSPECTOR), controller.submitToGOE.bind(controller));

// PASSO 3: GOE registra no sistema oficial e confirma
router.post('/:id/register', authenticate, authorize(UserRole.GOE), controller.registerSubstitution.bind(controller));

// PASSO 4: Completa a substituição
router.post('/:id/complete', authenticate, authorize(UserRole.INSPECTOR), controller.completeSubstitution.bind(controller));

// Cancelar substituição
router.post('/:id/cancel', authenticate, authorize(UserRole.INSPECTOR, UserRole.GOE), controller.cancel.bind(controller));

// Atualizar
router.put('/:id', authenticate, authorize(UserRole.INSPECTOR), controller.update.bind(controller));

export default router;