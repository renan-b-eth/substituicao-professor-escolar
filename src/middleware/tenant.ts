import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';

/**
 * Middleware de Multi-Tenancy
 * Extrai o schoolId do token JWT e adiciona às queries
 * Garante que usuários vejam apenas dados da sua escola
 */
export const tenantMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Super Admin pode acessar todas as escolas
  if (req.user?.role === UserRole.SUPER_ADMIN) {
    // Se super admin passar schoolId específico, usa ele
    req.schoolId = req.query.schoolId as string || req.user.schoolId || undefined;
    return next();
  }

  // Usuários normais só veem dados da sua escola
  if (!req.user?.schoolId) {
    return res.status(403).json({
      success: false,
      message: 'Escola não identificada. Contate o administrador.',
    });
  }

  req.schoolId = req.user.schoolId;
  next();
};

/**
 * Middleware para verificar se o usuário tem acesso a uma escola específica
 * Útil para operações de cross-school (Super Admin)
 */
export const requireSchoolAccess = (req: Request, res: Response, next: NextFunction) => {
  const requestedSchoolId = req.params.schoolId || req.body.schoolId;

  // Super Admin pode acessar qualquer escola
  if (req.user?.role === UserRole.SUPER_ADMIN) {
    return next();
  }

  // Outros usuários só podem acessar sua própria escola
  if (requestedSchoolId && requestedSchoolId !== req.user?.schoolId) {
    return res.status(403).json({
      success: false,
      message: 'Você não tem permissão para acessar dados de outra escola.',
    });
  }

  next();
};

/**
 * Filtro de tenancy para queries Prisma
 * Adiciona where schoolId automaticamente às consultas
 */
export const createTenantFilter = (schoolId: string | undefined, allowAll = false) => {
  if (!schoolId || !allowAll) {
    return { schoolId };
  }
  return {};
};