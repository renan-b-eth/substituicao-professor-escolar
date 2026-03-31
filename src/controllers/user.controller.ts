import { Request, Response } from 'express';
import prisma from '../config/database';
import bcrypt from 'bcryptjs';

export class UserController {
  async create(req: Request, res: Response) {
    try {
      const { email, password, name, role, schoolId } = req.body;

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: { email, password: hashedPassword, name, role, schoolId },
      });

      res.status(201).json({
        success: true,
        data: { id: user.id, email: user.email, name: user.name, role: user.role },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        return res.status(400).json({ success: false, message: 'Email já existe nesta escola' });
      }
      res.status(500).json({ success: false, message: 'Erro ao criar usuário' });
    }
  }

  async findAll(req: Request, res: Response) {
    try {
      const schoolId = req.schoolId!;
      const users = await prisma.user.findMany({
        where: { schoolId },
        select: { id: true, email: true, name: true, role: true, active: true, lastLogin: true },
      });
      res.json({ success: true, data: users });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao buscar usuários' });
    }
  }

  async findById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const schoolId = req.schoolId!;
      const user = await prisma.user.findFirst({ where: { id, schoolId } });
      if (!user) return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
      res.json({ success: true, data: { id: user.id, email: user.email, name: user.name, role: user.role } });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao buscar usuário' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const schoolId = req.schoolId!;
      const { name, email, password } = req.body;

      const data: any = { name, email };
      if (password) data.password = await bcrypt.hash(password, 10);

      const user = await prisma.user.update({ where: { id, schoolId }, data });
      res.json({ success: true, data: { id: user.id, email: user.email, name: user.name } });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao atualizar usuário' });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const schoolId = req.schoolId!;
      await prisma.user.update({ where: { id, schoolId }, data: { active: false } });
      res.json({ success: true, message: 'Usuário desativado' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao desativar usuário' });
    }
  }
}

export default new UserController();