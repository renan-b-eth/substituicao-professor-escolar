import { Request, Response } from 'express';
import prisma from '../config/database';

export class TeacherController {
  async create(req: Request, res: Response) {
    try {
      const { name, cpf, rg, email, phone, discipline, status } = req.body;
      const schoolId = req.schoolId!;

      const teacher = await prisma.teacher.create({
        data: { name, cpf, rg, email, phone, discipline, status, schoolId },
      });

      res.status(201).json({ success: true, data: teacher });
    } catch (error: any) {
      if (error.code === 'P2002') {
        return res.status(400).json({ success: false, message: 'CPF já existe' });
      }
      res.status(500).json({ success: false, message: 'Erro ao criar professor' });
    }
  }

  async findAll(req: Request, res: Response) {
    try {
      const schoolId = req.schoolId!;
      const { status, search } = req.query;

      const where: any = { schoolId };
      if (status) where.status = status;
      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { discipline: { contains: search as string, mode: 'insensitive' } },
        ];
      }

      const teachers = await prisma.teacher.findMany({ where, orderBy: { name: 'asc' } });
      res.json({ success: true, data: teachers });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao buscar professores' });
    }
  }

  async findById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const schoolId = req.schoolId!;
      const teacher = await prisma.teacher.findFirst({ where: { id, schoolId } });
      if (!teacher) return res.status(404).json({ success: false, message: 'Professor não encontrado' });
      res.json({ success: true, data: teacher });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao buscar professor' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const schoolId = req.schoolId!;
      const data = req.body;
      const teacher = await prisma.teacher.update({ where: { id, schoolId }, data });
      res.json({ success: true, data: teacher });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao atualizar professor' });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const schoolId = req.schoolId!;
      await prisma.teacher.update({ where: { id, schoolId }, data: { status: 'INACTIVE' } });
      res.json({ success: true, message: 'Professor desativado' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao desativar professor' });
    }
  }
}

export default new TeacherController();