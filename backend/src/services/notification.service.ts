import prisma from '../config/database';
import { NotificationType, NotificationPriority } from '@prisma/client';

interface CreateNotificationParams {
  title: string;
  message: string;
  type: NotificationType;
  priority?: NotificationPriority;
  userId?: string;
  schoolId: string;
  substitutionId?: string;
  targetRoles?: string[];
}

export class NotificationService {
  /**
   * Cria uma notificação para um usuário específico
   */
  async createNotification(params: CreateNotificationParams) {
    const { title, message, type, priority = 'MEDIUM', userId, schoolId, substitutionId } = params;

    if (!userId) {
      // Se não há userId específico, buscar usuários por role
      if (params.targetRoles) {
        return this.notifyByRole(params.targetRoles, { title, message, type, priority, schoolId, substitutionId });
      }
      return;
    }

    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        type,
        priority,
        userId,
        schoolId,
        substitutionId,
      },
    });

    // Emitir evento via Socket.io (se disponível)
    this.emitNotification(notification);

    return notification;
  }

  /**
   * Notifica todos os usuários de uma escola com determinadas roles
   */
  private async notifyByRole(roles: string[], params: Omit<CreateNotificationParams, 'userId'>) {
    const users = await prisma.user.findMany({
      where: {
        schoolId: params.schoolId,
        role: { in: roles as any },
        active: true,
      },
    });

    const notifications = await Promise.all(
      users.map((user) =>
        prisma.notification.create({
          data: {
            title: params.title,
            message: params.message,
            type: params.type,
            priority: params.priority,
            userId: user.id,
            schoolId: params.schoolId,
            substitutionId: params.substitutionId,
          },
        })
      )
    );

    // Emitir para todos
    notifications.forEach((n) => this.emitNotification(n));

    return notifications;
  }

  /**
   * Emite notificação via Socket.io (se o servidor estiver configurado)
   */
  private emitNotification(notification: any) {
    // Esta função será chamada pelo servidor HTTP que tem acesso ao io
    // Por agora, é apenas um placeholder - a implementação real virá com o servidor
    if (globalThis && (globalThis as any).io) {
      const io = (globalThis as any).io;
      io.to(`user-${notification.userId}`).emit('notification', notification);
    }
  }

  /**
   * Cria notificação de substituição solicitada (Inspetoria -> GOE)
   */
  async notifySubstitutionRequested(substitutionId: string, schoolId: string) {
    return this.createNotification({
      title: 'Nova Substituição Pendente',
      message: 'Há uma nova substituição aguardando registro.',
      type: 'SUBSTITUTION_REQUESTED',
      priority: 'HIGH',
      schoolId,
      substitutionId,
      targetRoles: ['GOE'],
    });
  }

  /**
   * Cria notificação de substituição registrada (GOE -> Inspetoria)
   */
  async notifySubstitutionRegistered(substitutionId: string, schoolId: string) {
    return this.createNotification({
      title: 'Substituição Registrada',
      message: 'A substituição foi registrada. O professor substituto pode fazer a chamada.',
      type: 'SUBSTITUTION_REGISTERED',
      priority: 'HIGH',
      schoolId,
      substitutionId,
      targetRoles: ['INSPECTOR'],
    });
  }

  /**
   * Cria notificação de substituição concluída
   */
  async notifySubstitutionCompleted(substitutionId: string, schoolId: string) {
    return this.createNotification({
      title: 'Substituição Concluída',
      message: 'A substituição foi finalizada com sucesso.',
      type: 'SUBSTITUTION_COMPLETED',
      priority: 'MEDIUM',
      schoolId,
      substitutionId,
      targetRoles: ['INSPECTOR', 'GOE'],
    });
  }

  /**
   * Cria notificação de substituição cancelada
   */
  async notifySubstitutionCancelled(substitutionId: string, schoolId: string, reason?: string) {
    return this.createNotification({
      title: 'Substituição Cancelada',
      message: reason ? `Substituição cancelada: ${reason}` : 'Uma substituição foi cancelada.',
      type: 'SUBSTITUTION_CANCELLED',
      priority: 'MEDIUM',
      schoolId,
      substitutionId,
      targetRoles: ['INSPECTOR', 'GOE'],
    });
  }
}

export default new NotificationService();