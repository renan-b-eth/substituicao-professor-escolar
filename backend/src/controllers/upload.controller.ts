import { Request, Response } from 'express';
import prisma from '../config/database';
import * as XLSX from 'xlsx';
import fs from 'fs';

export class UploadController {
  /**
   * Importa grade de horários via planilha Excel/CSV
   */
  async importSchedule(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Nenhum arquivo enviado' });
      }

      const schoolId = req.schoolId!;
      const filePath = req.file.path;
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

      // Mapeamento de colunas (ajuste conforme formato da planilha)
      const schedules = [];
      for (const row of data as any[]) {
        const dayMap: { [key: string]: string } = {
          'SEGUNDA': 'MONDAY', 'SEG': 'MONDAY',
          'TERÇA': 'TUESDAY', 'TER': 'TUESDAY',
          'QUARTA': 'WEDNESDAY', 'QUA': 'WEDNESDAY',
          'QUINTA': 'THURSDAY', 'QUI': 'THURSDAY',
          'SEXTA': 'FRIDAY', 'SEX': 'FRIDAY',
          'SÁBADO': 'SATURDAY', 'SAB': 'SATURDAY',
        };

        const periodMap: { [key: string]: string } = {
          'MANHÃ': 'MORNING', 'MANHA': 'MORNING',
          'TARDE': 'AFTERNOON',
          'NOITE': 'EVENING',
        };

        // Buscar professor pelo nome
        let teacherId = null;
        if (row.professor || row.professor_nome || row.professorNome) {
          const teacherName = row.professor || row.professor_nome || row.professorNome;
          const teacher = await prisma.teacher.findFirst({
            where: { name: { contains: teacherName, mode: 'insensitive' }, schoolId },
          });
          teacherId = teacher?.id;
        }

        const dayOfWeek = dayMap[row.dia?.toUpperCase()] || row.dayOfWeek;
        const period = periodMap[row.periodo?.toUpperCase()] || row.period;

        if (dayOfWeek && period && row.horario_inicio) {
          schedules.push({
            dayOfWeek,
            period,
            startTime: row.horario_inicio || row.startTime,
            endTime: row.horario_fim || row.endTime,
            className: row.turma || row.className,
            discipline: row.disciplina || row.discipline,
            originalTeacherId: teacherId,
            schoolId,
          });
        }
      }

      // Criar registros em lote (upsert para evitar duplicados)
      const created = [];
      for (const schedule of schedules) {
        const existing = await prisma.schedule.findFirst({
          where: {
            schoolId,
            dayOfWeek: schedule.dayOfWeek,
            period: schedule.period,
            className: schedule.className,
            startTime: schedule.startTime,
          },
        });

        if (existing) {
          await prisma.schedule.update({ where: { id: existing.id }, data: schedule });
        } else {
          const createdSchedule = await prisma.schedule.create({ data: schedule });
          created.push(createdSchedule);
        }
      }

      // Limpar arquivo temporário
      fs.unlinkSync(filePath);

      res.json({
        success: true,
        message: `${created.length} horários importados com sucesso`,
        data: { imported: created.length },
      });
    } catch (error) {
      console.error('Erro ao importar grade:', error);
      res.status(500).json({ success: false, message: 'Erro ao importar planilha' });
    }
  }

  /**
   * Importa professores via planilha Excel/CSV
   */
  async importTeachers(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Nenhum arquivo enviado' });
      }

      const schoolId = req.schoolId!;
      const filePath = req.file.path;
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

      const teachers = [];
      for (const row of data as any[]) {
        const name = row.nome || row.name || row.professor;
        if (name) {
          teachers.push({
            name,
            cpf: row.cpf || null,
            rg: row.rg || null,
            email: row.email || null,
            phone: row.telefone || row.phone || null,
            discipline: row.disciplina || row.discipline || null,
            status: 'ACTIVE',
            schoolId,
          });
        }
      }

      // Criar professores (ignora duplicados por CPF se existir)
      const created = [];
      for (const teacher of teachers) {
        try {
          if (teacher.cpf) {
            const existing = await prisma.teacher.findFirst({
              where: { cpf: teacher.cpf, schoolId },
            });
            if (existing) continue;
          }
          const createdTeacher = await prisma.teacher.create({ data: teacher });
          created.push(createdTeacher);
        } catch (e) {
          // Ignora erros de duplicados
        }
      }

      fs.unlinkSync(filePath);

      res.json({
        success: true,
        message: `${created.length} professores importados com sucesso`,
        data: { imported: created.length },
      });
    } catch (error) {
      console.error('Erro ao importar professores:', error);
      res.status(500).json({ success: false, message: 'Erro ao importar professores' });
    }
  }
}

export default new UploadController();