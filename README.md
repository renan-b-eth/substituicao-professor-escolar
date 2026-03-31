# Sistema de Substituição de Professores - Backend

## Visão Geral do Projeto

Este é um sistema SaaS Multi-Tenant para gestão de faltas e substituições de professores, desenvolvido para a rede estadual de ensino.

## 🚀 Tecnologias

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **ORM**: Prisma
- **Banco de Dados**: PostgreSQL
- **Autenticação**: JWT (JSON Web Tokens)
- **Upload de Arquivos**: Multer + xlsx (Excel)
- **PDF**: PDFKit

## 📁 Estrutura do Projeto

```
src/
├── config/           # Configurações globais
│   ├── app.ts       # Configuração do Express
│   └── database.ts  # Configuração do Prisma
├── controllers/      # Controladores (lógica de negócio)
│   ├── auth.controller.ts
│   ├── school.controller.ts
│   ├── user.controller.ts
│   ├── teacher.controller.ts
│   ├── schedule.controller.ts
│   ├── substitution.controller.ts
│   ├── notification.controller.ts
│   ├── upload.controller.ts
│   └── report.controller.ts
├── middleware/       # Middlewares do Express
│   ├── auth.ts      # Autenticação e autorização JWT
│   ├── tenant.ts    # Middleware de Multi-Tenancy
│   └── errorHandler.ts
├── routes/          # Definição das rotas REST
│   ├── auth.routes.ts
│   ├── school.routes.ts
│   ├── user.routes.ts
│   ├── teacher.routes.ts
│   ├── schedule.routes.ts
│   ├── substitution.routes.ts
│   ├── notification.routes.ts
│   ├── upload.routes.ts
│   └── report.routes.ts
├── services/         # Serviços especializados
│   └── notification.service.ts
├── types/           # Tipos TypeScript
│   └── index.ts
└── index.ts         # Ponto de entrada
```

## 🗄️ Modelo de Dados (Multi-Tenant)

Todas as tabelas principais possuem `schoolId` para garantir isolamento de dados entre escolas:

### Entidades Principais:

1. **School** (Escola) - Tenant
2. **User** (Usuário) - Com RBAC (Super Admin, Secretary, Inspector, GOE)
3. **Teacher** (Professor)
4. **Schedule** (Grade de Aulas)
5. **Substitution** (Substituição) - Fluxo principal
6. **Notification** (Notificações In-App)
7. **AuditLog** (Log de Auditoria)

## 🔐 Sistema de Permissões (RBAC)

| Role       | Descrição                                    | Permissões                                |
|------------|----------------------------------------------|-------------------------------------------|
| SUPER_ADMIN| Gerencia todas as escolas                    | CRUD total, acesso cross-school          |
| SECRETARY  | Importa planilhas (Excel/CSV)               | Importar dados, CRUD básico              |
| INSPECTOR  | Painel operacional diário                    | Criar substituições, confirmar legitimacy|
| GOE        | Validação e registros oficiais               | Registrar substituições, validar         |

## 🔄 Fluxo de Substituição

```
PASSO 1: Inspetora registra falta + seleciona professor substituto
         └─> Confirma "Legitimidade da Troca"
         └─> Status: DRAFT -> legitimacyConfirmed: true

PASSO 2: Submete para GOE
         └─> Status: PENDING_GOE
         └─> Notificação automática para GOE

PASSO 3: GOE registra no sistema oficial + confirma
         └─> Preenche officialRegisterId
         └─> Status: REGISTERED
         └─> Notificação para Inspetora

PASSO 4: Inspetora completa substituição
         └─> Status: COMPLETED
```

## 📡 Endpoints da API

### Autenticação
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/register` - Registro
- `GET /api/v1/auth/me` - Dados do usuário atual

### Escolas (Super Admin)
- `GET /api/v1/schools` - Listar escolas
- `POST /api/v1/schools` - Criar escola
- `PUT /api/v1/schools/:id` - Atualizar escola

### Usuários
- `GET /api/v1/users` - Listar usuários da escola
- `POST /api/v1/users` - Criar usuário

### Professores
- `GET /api/v1/teachers` - Listar professores
- `POST /api/v1/teachers` - Criar professor

### Grade de Aulas
- `GET /api/v1/schedules` - Listar grade
- `POST /api/v1/schedules` - Criar aula

### Substituições (Fluxo Principal)
- `POST /api/v1/substitutions` - Criar substituição (Inspetor)
- `GET /api/v1/substitutions/today` - Substituições do dia
- `GET /api/v1/substitutions/pending-goe` - Pendências GOE
- `POST /api/v1/substitutions/:id/confirm-legitimacy` - Confirmar legitimidade
- `POST /api/v1/substitutions/:id/submit-goe` - Enviar para GOE
- `POST /api/v1/substitutions/:id/register` - GOE registra
- `POST /api/v1/substitutions/:id/complete` - Completar

### Notificações
- `GET /api/v1/notifications` - Listar notificações
- `GET /api/v1/notifications/unread` - Não lidas
- `PUT /api/v1/notifications/:id/read` - Marcar como lida

### Importação (Planilhas)
- `POST /api/v1/upload/schedule` - Importar grade (Excel/CSV)
- `POST /api/v1/upload/teachers` - Importar professores

### Relatórios
- `GET /api/v1/reports/daily-substitutions/pdf` - Relatório PDF do dia
- `GET /api/v1/reports/dashboard/stats` - Estatísticas do dashboard

## 🚀 Como Executar

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar banco de dados
```bash
# Criar banco PostgreSQL
createdb substituicao_escolar

# Configurar .env com URL de conexão
DATABASE_URL="postgresql://user:password@localhost:5432/substituicao_escolar"
```

### 3. Gerar Prisma Client e criar tabelas
```bash
npm run prisma:generate
npm run prisma:migrate
```

### 4. Iniciar servidor
```bash
npm run dev
```

O servidor estará disponível em: `http://localhost:3000`

## 📝 Variáveis de Ambiente

Consulte o arquivo `.env` para configuração:
- `PORT` - Porta do servidor
- `DATABASE_URL` - String de conexão PostgreSQL
- `JWT_SECRET` - Chave secreta para JWT
- `JWT_EXPIRES_IN` - Tempo de expiração do token
- `UPLOAD_DIR` - Diretório para uploads
- `MAX_FILE_SIZE` - Tamanho máximo de arquivo

## 🔧 Próximos Passos

1. **Frontend**: Desenvolver interface web (React/Vue)
2. **Socket.io**: Implementar notificações em tempo real
3. **Validações**: Adicionar validações mais robustas (Zod/Joi)
4. **Tests**: Implementar testes unitários e integração