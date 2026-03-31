import { Request, Response } from 'express';
import prisma from '../config/database';

export class ScheduleController {
  async create(req: Request, res: Response) {
    try {
      const { dayOfWeek, period, startTime, endTime, className, discipline, originalTeacherId } = req.body;
      const schoolId = req.schoolId!;

      const schedule = await prisma.schedule.create({
        data: { dayOfWeek, period, startTime, endTime, className, discipline, schoolId, originalTeacherId },
      });

      res.status(201).json({ success: true, data: schedule });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao criar aula' });
    }
  }

  async findAll(req: Request, res: Response) {
    try {
      const schoolId = req.schoolId!;
      const { dayOfWeek, period, className } = req.query;

      const where: any = { schoolId };
      if (dayOfWeek) where.dayOfWeek = dayOfWeek;
      if (period) where.period = period;
      if (className) where.className = { contains: className as string, mode: 'insensitive' };

      const schedules = await prisma.schedule.findMany({
        where,
        include: { originalTeacher: true, substituteTeacher: true },
        orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
      });

      res.json({ success: true, data: schedules });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao buscar grade' });
    }
  }

  async findById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const schoolId = req.schoolId!;
      const schedule = await prisma.schedule.findFirst({
        where: { id, schoolId },
        include: { originalTeacher: true, substituteTeacher: true },
      });
      if (!schedule) return res.status(404).json({ success: false, message: 'Aula não encontrada' });
      res.json({ success: true, data: schedule });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao buscar aula' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const schoolId = req.schoolId!;
      const data = req.body;
      const schedule = await prisma.schedule.update({ where: { id, schoolId }, data });
      res.json({ success: true, data: schedule });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao atualizar aula' });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const schoolId = req.schoolId!;
      await prisma.schedule.delete({ where: { id, schoolId } });
      res.json({ success: true, message: 'Aula removida' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao remover aula' });
    }
  }
}

export default new ScheduleController();