import { Request, Response } from 'express';
import prisma from '../config/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types';

export class AuthController {
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email e senha são obrigatórios',
        });
      }

      // Buscar usuário (inclui school para response)
      const user = await prisma.user.findFirst({
        where: { email },
        include: { school: true },
      });

      if (!user || !user.active) {
        return res.status(401).json({
          success: false,
          message: 'Credenciais inválidas',
        });
      }

      // Verificar senha
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Credenciais inválidas',
        });
      }

      // Gerar token JWT
      const payload: JwtPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        schoolId: user.schoolId,
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET || 'default-secret', {
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      });

      // Atualizar último login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      });

      res.json({
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            schoolId: user.schoolId,
            schoolName: user.school?.name,
          },
        },
      });
    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao realizar login',
      });
    }
  }

  async register(req: Request, res: Response) {
    try {
      const { email, password, name, role, schoolId } = req.body;

      // Verificar se email já existe na escola
      const existingUser = await prisma.user.findFirst({
        where: { email, schoolId },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email já cadastrado nesta escola',
        });
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(password, 10);

      // Criar usuário
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role,
          schoolId,
        },
        include: { school: true },
      });

      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role, schoolId: user.schoolId },
        process.env.JWT_SECRET || 'default-secret',
        { expiresIn: '24h' }
      );

      res.status(201).json({
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            schoolId: user.schoolId,
          },
        },
      });
    } catch (error) {
      console.error('Erro no registro:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao registrar usuário',
      });
    }
  }

  async me(req: Request, res: Response) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user?.userId },
        include: { school: true },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado',
        });
      }

      res.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          schoolId: user.schoolId,
          schoolName: user.school?.name,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar dados do usuário',
      });
    }
  }

  async refreshToken(req: Request, res: Response) {
    try {
      const token = req.body.token;
      if (!token) {
        return res.status(400).json({ success: false, message: 'Token obrigatório' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as JwtPayload;
      const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

      if (!user || !user.active) {
        return res.status(401).json({ success: false, message: 'Usuário inválido' });
      }

      const newToken = jwt.sign(
        { userId: user.id, email: user.email, role: user.role, schoolId: user.schoolId },
        process.env.JWT_SECRET || 'default-secret',
        { expiresIn: '24h' }
      );

      res.json({ success: true, data: { token: newToken } });
    } catch (error) {
      res.status(401).json({ success: false, message: 'Token inválido' });
    }
  }

  async logout(req: Request, res: Response) {
    // Em uma implementação mais robusta, poderíamos invalidar o token no banco
    res.json({ success: true, message: 'Logout realizado com sucesso' });
  }
}

export default new AuthController();