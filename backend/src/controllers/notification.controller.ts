import { Request, Response } from 'express';
import prisma from '../config/database';

export class NotificationController {
  async findAll(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { page = 1, limit = 20 } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          skip,
          take: Number(limit),
        }),
        prisma.notification.count({ where: { userId } }),
      ]);

      res.json({
        success: true,
        data: notifications,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao buscar notificações' });
    }
  }

  async getUnread(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;

      const notifications = await prisma.notification.findMany({
        where: { userId, read: false },
        orderBy: { createdAt: 'desc' },
      });

      res.json({ success: true, data: notifications });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao buscar notificações' });
    }
  }

  async findById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const notification = await prisma.notification.findFirst({
        where: { id, userId },
      });

      if (!notification) {
        return res.status(404).json({ success: false, message: 'Notificação não encontrada' });
      }

      res.json({ success: true, data: notification });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao buscar notificação' });
    }
  }

  async markAsRead(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const notification = await prisma.notification.findFirst({
        where: { id, userId },
      });

      if (!notification) {
        return res.status(404).json({ success: false, message: 'Notificação não encontrada' });
      }

      const updated = await prisma.notification.update({
        where: { id },
        data: { read: true, readAt: new Date() },
      });

      res.json({ success: true, data: updated });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao marcar como lida' });
    }
  }

  async markAllAsRead(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;

      await prisma.notification.updateMany({
        where: { userId, read: false },
        data: { read: true, readAt: new Date() },
      });

      res.json({ success: true, message: 'Todas as notificações marcadas como lidas' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao marcar notificações como lidas' });
    }
  }
}

export default new NotificationController();