import { Request, Response } from 'express';
import prisma from '../config/database';

export class SchoolController {
  async create(req: Request, res: Response) {
    try {
      const { name, cnpj, inepCode, address, phone, email, director } = req.body;

      const school = await prisma.school.create({
        data: { name, cnpj, inepCode, address, phone, email, director },
      });

      res.status(201).json({ success: true, data: school });
    } catch (error: any) {
      if (error.code === 'P2002') {
        return res.status(400).json({ success: false, message: 'CNPJ ou código INEP já existe' });
      }
      res.status(500).json({ success: false, message: 'Erro ao criar escola' });
    }
  }

  async findAll(req: Request, res: Response) {
    try {
      const schools = await prisma.school.findMany({
        where: { active: true },
        orderBy: { name: 'asc' },
      });
      res.json({ success: true, data: schools });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao buscar escolas' });
    }
  }

  async findById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const school = await prisma.school.findUnique({ where: { id } });
      if (!school) {
        return res.status(404).json({ success: false, message: 'Escola não encontrada' });
      }
      res.json({ success: true, data: school });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao buscar escola' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body;
      const school = await prisma.school.update({ where: { id }, data });
      res.json({ success: true, data: school });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao atualizar escola' });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.school.update({ where: { id }, data: { active: false } });
      res.json({ success: true, message: 'Escola desativada com sucesso' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao desativar escola' });
    }
  }
}

export default new SchoolController();