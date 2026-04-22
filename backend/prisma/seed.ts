/**
 * Seed Script - Popula o banco com dados reais de professores e disciplinas
 * Execute: npx prisma db seed ou ts-node prisma/seed.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Criar escola de exemplo
  const school = await prisma.school.upsert({
    where: { inepCode: '12345678' },
    update: {},
    create: {
      name: 'EEProfMariaAparecidaSilva',
      cnpj: '12.345.678/0001-90',
      inepCode: '12345678',
      address: 'Rua das Escolas, 123 - Centro',
      phone: '(11) 1234-5678',
      email: 'eeprofma@saudeedu.com.br',
      director: 'Maria da Conceição Santos',
      active: true,
    },
  });
  console.log(`✅ Escola criada: ${school.name}`);

  // Usuários do sistema (diretores, GOE, coordenadores, inspetores)
  const passwordHash = await bcrypt.hash('123456', 10);

  // Criar usuários para diferentes roles
  const users = [
    // Diretora
    { name: 'Maria da Conceição Santos', email: 'diretora@escola.edu', role: 'DIRECTOR' as const, cpf: '111.111.111-11' },
    // GOE (Gestora de Organização Escolar)
    { name: 'Ana Paula Rodrigues', email: 'goe@escola.edu', role: 'GOE' as const, cpf: '222.222.222-22' },
    // Coordenadora Pedagógica
    { name: 'Claudia Fernandes Lima', email: 'coordenadora@escola.edu', role: 'COORDINATOR' as const, cpf: '333.333.333-33' },
    // Inspetora de Alunos
    { name: 'Roberta Martins Costa', email: 'inspetora@escola.edu', role: 'INSPECTOR' as const, cpf: '444.444.444-44' },
    // Secretaria
    { name: 'Juliana Almeida Souza', email: 'secretaria@escola.edu', role: 'SECRETARY' as const, cpf: '555.555.555-55' },
  ];

  for (const userData of users) {
    await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        name: userData.name,
        email: userData.email,
        password: passwordHash,
        role: userData.role,
        cpf: userData.cpf,
        schoolId: school.id,
        active: true,
      },
    });
  }
  console.log('✅ Usuários criados (senha padrão: 123456)');

  // Professores com disciplinas reais
  const teachersData = [
    // Língua Portuguesa
    { name: 'Maria do Socorro Vieira', discipline: 'Língua Portuguesa', cpf: '111.222.333-01' },
    { name: 'José Carlos de Oliveira', discipline: 'Língua Portuguesa', cpf: '111.222.333-02' },
    { name: 'Ana Lucia Martins', discipline: 'Língua Portuguesa', cpf: '111.222.333-03' },
    
    // Matemática
    { name: 'Pedro Henrique Santos', discipline: 'Matemática', cpf: '111.222.333-04' },
    { name: 'Claudia Regina Souza', discipline: 'Matemática', cpf: '111.222.333-05' },
    { name: 'Roberto Carlos Silva', discipline: 'Matemática', cpf: '111.222.333-06' },
    
    // Ciências
    { name: 'Fernanda Costa Lima', discipline: 'Ciências', cpf: '111.222.333-07' },
    { name: 'Marcos Antonio Ferreira', discipline: 'Ciências', cpf: '111.222.333-08' },
    
    // História
    { name: 'Juliana Pereira Santos', discipline: 'História', cpf: '111.222.333-09' },
    { name: 'Antonio Carlos Mendes', discipline: 'História', cpf: '111.222.333-10' },
    
    // Geografia
    { name: 'Carla Beatriz Rodrigues', discipline: 'Geografia', cpf: '111.222.333-11' },
    { name: 'Eduardo José Nascimento', discipline: 'Geografia', cpf: '111.222.333-12' },
    
    // Educação Física
    { name: 'Ricardo Souza Almeida', discipline: 'Educação Física', cpf: '111.222.333-13' },
    { name: 'Patrícia Cristina Rocha', discipline: 'Educação Física', cpf: '111.222.333-14' },
    
    // Arte
    { name: 'Luciana Maria Barbosa', discipline: 'Arte', cpf: '111.222.333-15' },
    
    // Inglês
    { name: 'Sandro Roberto Lopes', discipline: 'Inglês', cpf: '111.222.333-16' },
    
    // Espanhol
    { name: 'Carmen Lucia Vargas', discipline: 'Espanhol', cpf: '111.222.333-17' },
    
    // Filosofia
    { name: 'Wilson dos Santos', discipline: 'Filosofia', cpf: '111.222.333-18' },
    
    // Sociologia
    { name: 'Tania Mara Gomes', discipline: 'Sociologia', cpf: '111.222.333-19' },
    
    // Física
    { name: 'Paulo Roberto Martins', discipline: 'Física', cpf: '111.222.333-20' },
    
    // Química
    { name: 'Adriana Cristina Silva', discipline: 'Química', cpf: '111.222.333-21' },
    
    // Biologia
    { name: 'Márcia Maria Costa', discipline: 'Biologia', cpf: '111.222.333-22' },
    
    // Informática
    { name: 'Leonardo Henrique Souza', discipline: 'Informática', cpf: '111.222.333-23' },
  ];

  const teachers = [];
  for (const teacherData of teachersData) {
    const teacher = await prisma.teacher.upsert({
      where: { cpf: teacherData.cpf },
      update: {},
      create: {
        name: teacherData.name,
        cpf: teacherData.cpf,
        email: teacherData.cpf.replace(/[^0-9]/g, '') + '@escola.edu',
        phone: '(11) 9' + Math.floor(Math.random() * 90000000 + 10000000).toString(),
        discipline: teacherData.discipline,
        status: 'ACTIVE',
        schoolId: school.id,
      },
    });
    teachers.push(teacher);
  }
  console.log(`✅ ${teachers.length} professores criados`);

  // Criar Grade de Horários (Schedule)
  // Segundas-feiras, 6 aulas pela manhã
  const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
  const periods = ['MORNING', 'AFTERNOON'];
  const classNames = ['6º Ano A', '6º Ano B', '7º Ano A', '7º Ano B', '8º Ano A', '8º Ano B', '9º Ano A', '9º Ano B', '1º Ano EM', '2º Ano EM', '3º Ano EM'];

  const timeSlots = {
    MORNING: [
      { start: '07:30', end: '08:20' },
      { start: '08:20', end: '09:10' },
      { start: '09:10', end: '10:00' },
      { start: '10:20', end: '11:10' },
      { start: '11:10', end: '12:00' },
      { start: '12:00', end: '12:50' },
    ],
    AFTERNOON: [
      { start: '13:00', end: '13:50' },
      { start: '13:50', end: '14:40' },
      { start: '14:40', end: '15:30' },
      { start: '15:50', end: '16:40' },
      { start: '16:40', end: '17:30' },
      { start: '17:30', end: '18:20' },
    ],
  };

  let scheduleCount = 0;
  for (const day of daysOfWeek) {
    for (const period of periods) {
      const times = timeSlots[period];
      for (const time of times) {
        // Para cada horário, atribuindo professor aleatório da disciplina
        const randomTeacher = teachers[Math.floor(Math.random() * teachers.length)];
        const randomClass = classNames[Math.floor(Math.random() * classNames.length)];

        try {
          await prisma.schedule.upsert({
            where: {
              schoolId_dayOfWeek_period_className_startTime: {
                schoolId: school.id,
                dayOfWeek: day as any,
                period: period as any,
                className: randomClass,
                startTime: time.start,
              }
            },
            update: {},
            create: {
              dayOfWeek: day as any,
              period: period as any,
              startTime: time.start,
              endTime: time.end,
              className: randomClass,
              discipline: randomTeacher.discipline || 'Língua Portuguesa',
              originalTeacherId: randomTeacher.id,
              schoolId: school.id,
              hasSubstitution: false,
            },
          });
          scheduleCount++;
        } catch (e) {
          // Ignora duplicate
        }
      }
    }
  }
  console.log(`✅ ${scheduleCount} horários criados`);

  console.log('\n🎉 Seed concluído com sucesso!');
  console.log('\n📋 Dados de acesso (senha: 123456):');
  console.log('   Diretora: diretoria@escola.edu');
  console.log('   GOE: goe@escola.edu');
  console.log('   Coordenadora: coordenadora@escola.edu');
  console.log('   Inspetora: inspetora@escola.edu');
  console.log('   Secretaria: secretaria@escola.edu');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });