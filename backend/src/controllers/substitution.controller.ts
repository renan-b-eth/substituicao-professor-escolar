import { Request, Response } from 'express';
import prisma from '../config/database';
import { NotificationService } from '../services/notification.service';

export class SubstitutionController {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  /**
   * PASSO 1: Cria substituição e confirma legitimidade
   * A Inspetora registra a falta e seleciona o substituto
   */
  async create(req: Request, res: Response) {
    try {
      const { scheduleId, substituteTeacherId, date, reason, notes } = req.body;
      const schoolId = req.schoolId!;
      const userId = req.user!.userId;

      // Validar schedule existe
      const schedule = await prisma.schedule.findFirst({
        where: { id: scheduleId, schoolId },
        include: { originalTeacher: true },
      });

      if (!schedule) {
        return res.status(404).json({
          success: false,
          message: 'Aula não encontrada',
        });
      }

      // Validar professor substituto existe
      const substituteTeacher = await prisma.teacher.findFirst({
        where: { id: substituteTeacherId, schoolId },
      });

      if (!substituteTeacher) {
        return res.status(404).json({
          success: false,
          message: 'Professor substituto não encontrado',
        });
      }

      // Criar substituição com legitimidade confirmada automaticamente
      const substitution = await prisma.substitution.create({
        data: {
          scheduleId,
          schoolId,
          originalTeacherId: schedule.originalTeacherId!,
          substituteTeacherId,
          date: new Date(date),
          reason,
          notes,
          legitimacyConfirmed: true,
          legitimacyConfirmedAt: new Date(),
          legitimacyConfirmedBy: userId,
          status: 'PENDING_GOE', // Já vai para GOE
        },
        include: {
          originalTeacher: true,
          substituteTeacher: true,
          schedule: true,
        },
      });

      // Notificar GOE
      await this.notificationService.createNotification({
        title: 'Nova Substituição Pendente',
        message: `Substituição solicitada para ${substitution.originalTeacher.name} - ${substitution.date.toLocaleDateString()}`,
        type: 'SUBSTITUTION_REQUESTED',
        priority: 'HIGH',
        userId: '', // Broadcaster will handle this
        schoolId,
        substitutionId: substitution.id,
        targetRoles: ['GOE'],
      });

      res.status(201).json({
        success: true,
        data: substitution,
        message: 'Substituição registrada e enviada para GOE',
      });
    } catch (error) {
      console.error('Erro ao criar substituição:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao registrar substituição',
      });
    }
  }

  /**
   * PASSO 2: Submeter para GOE (após confirmar legitimidade)
   */
  async submitToGOE(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const schoolId = req.schoolId!;

      const substitution = await prisma.substitution.findFirst({
        where: { id, schoolId },
      });

      if (!substitution) {
        return res.status(404).json({ success: false, message: 'Substituição não encontrada' });
      }

      if (!substitution.legitimacyConfirmed) {
        return res.status(400).json({
          success: false,
          message: 'Confirmação de legitimidade é obrigatória',
        });
      }

      const updated = await prisma.substitution.update({
        where: { id },
        data: { status: 'PENDING_GOE' },
      });

      res.json({ success: true, data: updated, message: 'Enviado para GOE' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao enviar para GOE' });
    }
  }

  /**
   * Confirma legitimidade da troca (PASSO 1)
   */
  async confirmLegitimacy(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const schoolId = req.schoolId!;
      const userId = req.user!.userId;

      const substitution = await prisma.substitution.findFirst({
        where: { id, schoolId },
      });

      if (!substitution) {
        return res.status(404).json({ success: false, message: 'Substituição não encontrada' });
      }

      const updated = await prisma.substitution.update({
        where: { id },
        data: {
          legitimacyConfirmed: true,
          legitimacyConfirmedAt: new Date(),
          legitimacyConfirmedBy: userId,
        },
      });

      res.json({
        success: true,
        data: updated,
        message: 'Legitimidade confirmada',
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao confirmar legitimidade' });
    }
  }

  /**
   * PASSO 3: GOE registra no sistema oficial e confirma
   */
  async registerSubstitution(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { officialRegisterId } = req.body;
      const schoolId = req.schoolId!;
      const userId = req.user!.userId;

      const substitution = await prisma.substitution.findFirst({
        where: { id, schoolId },
        include: {
          originalTeacher: true,
          substituteTeacher: true,
        },
      });

      if (!substitution) {
        return res.status(404).json({ success: false, message: 'Substituição não encontrada' });
      }

      if (substitution.status !== 'PENDING_GOE') {
        return res.status(400).json({
          success: false,
          message: 'Substituição não está pendente de registro',
        });
      }

      const updated = await prisma.substitution.update({
        where: { id },
        data: {
          status: 'REGISTERED',
          goeRegisteredAt: new Date(),
          goeRegisteredBy: userId,
          officialRegisterId,
        },
        include: {
          originalTeacher: true,
          substituteTeacher: true,
        },
      });

      // Notificar Inspetora
      await this.notificationService.createNotification({
        title: 'Substuição Registrada',
        message: `Substituição de ${substitution.originalTeacher.name} foi registrada. O professor substituto pode fazer a chamada.`,
        type: 'SUBSTITUTION_REGISTERED',
        priority: 'HIGH',
        userId: '', // Broadcaster
        schoolId,
        substitutionId: substitution.id,
        targetRoles: ['INSPECTOR'],
      });

      res.json({
        success: true,
        data: updated,
        message: 'Substituição registrada com sucesso',
      });
    } catch (error) {
      console.error('Erro ao registrar substituição:', error);
      res.status(500).json({ success: false, message: 'Erro ao registrar substituição' });
    }
  }

  /**
   * PASSO 4: Completa a substituição
   */
  async completeSubstitution(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const schoolId = req.schoolId!;

      const updated = await prisma.substitution.update({
        where: { id: id, schoolId: schoolId },
        data: { status: 'COMPLETED' },
      });

      res.json({
        success: true,
        data: updated,
        message: 'Substituição concluída',
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao completar substituição' });
    }
  }

  /**
   * Lista todas as substituições
   */
  async findAll(req: Request, res: Response) {
    try {
      const schoolId = req.schoolId!;
      const { status, date, startDate, endDate } = req.query;

      const where: any = { schoolId };

      if (status) where.status = status;
      if (date) where.date = new Date(date as string);
      if (startDate && endDate) {
        where.date = {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string),
        };
      }

      const substitutions = await prisma.substitution.findMany({
        where,
        include: {
          originalTeacher: true,
          substituteTeacher: true,
          schedule: true,
        },
        orderBy: { date: 'desc' },
      });

      res.json({ success: true, data: substitutions });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao buscar substituições' });
    }
  }

  /**
   * Lista substituições do dia
   */
  async getTodaySubstitutions(req: Request, res: Response) {
    try {
      const schoolId = req.schoolId!;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const substitutions = await prisma.substitution.findMany({
        where: {
          schoolId,
          date: {
            gte: today,
            lt: tomorrow,
          },
        },
        include: {
          originalTeacher: true,
          substituteTeacher: true,
          schedule: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json({ success: true, data: substitutions });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao buscar substituições do dia' });
    }
  }

  /**
   * Lista substituições pendentes para GOE
   */
  async getPendingGOE(req: Request, res: Response) {
    try {
      const schoolId = req.schoolId!;

      const substitutions = await prisma.substitution.findMany({
        where: {
          schoolId,
          status: 'PENDING_GOE',
        },
        include: {
          originalTeacher: true,
          substituteTeacher: true,
          schedule: true,
        },
        orderBy: { date: 'asc' },
      });

      res.json({ success: true, data: substitutions });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao buscar pendências' });
    }
  }

  async findById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const schoolId = req.schoolId!;

      const substitution = await prisma.substitution.findFirst({
        where: { id, schoolId },
        include: {
          originalTeacher: true,
          substituteTeacher: true,
          schedule: true,
        },
      });

      if (!substitution) {
        return res.status(404).json({ success: false, message: 'Substituição não encontrada' });
      }

      res.json({ success: true, data: substitution });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao buscar substituição' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const schoolId = req.schoolId!;
      const data = req.body;

      const updated = await prisma.substitution.update({
        where: { id, schoolId },
        data,
      });

      res.json({ success: true, data: updated });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao atualizar substituição' });
    }
  }

  async cancel(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const schoolId = req.schoolId!;

      const updated = await prisma.substitution.update({
        where: { id, schoolId },
        data: { status: 'CANCELLED' },
      });

      res.json({ success: true, data: updated, message: 'Substituição cancelada' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao cancelar substituição' });
    }
  }
}

export default new SubstitutionController();