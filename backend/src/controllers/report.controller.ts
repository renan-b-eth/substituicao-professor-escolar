import { Request, Response } from 'express';
import prisma from '../config/database';
import PDFDocument from 'pdfkit';

export class ReportController {
  /**
   * Gera relatório PDF de substituições do dia
   */
  async generateDailyReport(req: Request, res: Response) {
    try {
      const schoolId = req.schoolId!;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const substitutions = await prisma.substitution.findMany({
        where: {
          schoolId,
          date: { gte: today, lt: tomorrow },
        },
        include: {
          originalTeacher: true,
          substituteTeacher: true,
          schedule: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      const school = await prisma.school.findUnique({ where: { id: schoolId } });

      // Configurar resposta para PDF
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=relatorio-substitucoes-${today.toISOString().split('T')[0]}.pdf`);

      const doc = new PDFDocument({ margin: 50 });
      doc.pipe(res);

      // Título
      doc.fontSize(20).text('Relatório de Substituições', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Escola: ${school?.name || 'N/A'}`);
      doc.text(`Data: ${today.toLocaleDateString('pt-BR')}`);
      doc.text(`Total de Substituições: ${substitutions.length}`);
      doc.moveDown();

      // Tabela de substituições
      if (substitutions.length > 0) {
        doc.fontSize(10).text('─'.repeat(80));
        doc.text('Horário | Professor Faltou | Substituto | Motivo | Status');
        doc.text('─'.repeat(80));

        for (const sub of substitutions) {
          const time = sub.schedule?.startTime || '-';
          const original = sub.originalTeacher?.name || '-';
          const substitute = sub.substituteTeacher?.name || '-';
          const reason = sub.reason || '-';
          const status = sub.status || '-';

          doc.text(`${time} | ${original} | ${substitute} | ${reason} | ${status}`);
        }
        doc.text('─'.repeat(80));
      } else {
        doc.text('Nenhuma substituição registrada hoje.');
      }

      // Rodapé
      doc.moveDown(2);
      doc.fontSize(8).text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, { align: 'right' });

      doc.end();
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      res.status(500).json({ success: false, message: 'Erro ao gerar relatório PDF' });
    }
  }

  /**
   * Relatório de substituições por período
   */
  async getSubstitutionsReport(req: Request, res: Response) {
    try {
      const schoolId = req.schoolId!;
      const { startDate, endDate } = req.query;

      const where: any = { schoolId };
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
        },
        orderBy: { date: 'desc' },
      });

      // Estatísticas
      const stats = {
        total: substitutions.length,
        byStatus: {} as Record<string, number>,
        byReason: {} as Record<string, number>,
      };

      for (const sub of substitutions) {
        stats.byStatus[sub.status] = (stats.byStatus[sub.status] || 0) + 1;
        stats.byReason[sub.reason] = (stats.byReason[sub.reason] || 0) + 1;
      }

      res.json({ success: true, data: { substitutions, stats } });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao buscar relatório' });
    }
  }

  /**
   * Estatísticas para o Dashboard
   */
  async getDashboardStats(req: Request, res: Response) {
    try {
      const schoolId = req.schoolId!;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Substituições de hoje
      const todaySubstitutions = await prisma.substitution.findMany({
        where: { schoolId, date: { gte: today, lt: tomorrow } },
      });

      // Pendentes GOE
      const pendingGOE = await prisma.substitution.count({
        where: { schoolId, status: 'PENDING_GOE' },
      });

      // Registradas hoje
      const registeredToday = await prisma.substitution.count({
        where: { schoolId, status: 'REGISTERED', date: { gte: today, lt: tomorrow } },
      });

      // Total de professores ativos
      const totalTeachers = await prisma.teacher.count({
        where: { schoolId, status: 'ACTIVE' },
      });

      // Professores disponíveis para substituição (não têm aula no horário atual)
      // Por simplificação, retornamos o total
      const availableTeachers = totalTeachers;

      res.json({
        success: true,
        data: {
          todaySubstitutions: todaySubstitutions.length,
          pendingGOE,
          registeredToday,
          totalTeachers,
          availableTeachers,
          recentSubstitutions: todaySubstitutions.slice(0, 5),
        },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao buscar estatísticas' });
    }
  }
}

export default new ReportController();