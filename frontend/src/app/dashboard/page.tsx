'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  GraduationCap, 
  Users, 
  ClipboardList, 
  FileText, 
  Settings, 
  Bell,
  LogOut,
  Search,
  Plus,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

const menuItems = [
  { icon: ClipboardList, label: 'Faltas', href: '#faltas', active: true },
  { icon: Users, label: 'Professores', href: '#professores' },
  { icon: FileText, label: 'Relatórios', href: '#relatorios' },
  { icon: Settings, label: 'Configurações', href: '#configuracoes' },
];

// Mock data para substituições do dia
const todaySubstitutions = [
  { id: 1, teacher: 'Maria Santos', subject: 'Matemática', period: '1º Aula', substitute: 'João Silva', status: 'PENDING_GOE' },
  { id: 2, teacher: 'Pedro Oliveira', subject: 'História', period: '3º Aula', substitute: 'Ana Costa', status: 'REGISTERED' },
  { id: 3, teacher: 'Julia Ferreira', subject: 'Português', period: '5º Aula', substitute: 'Carlos Lima', status: 'COMPLETED' },
];

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('faltas');

  const handleLogout = () => {
    router.push('/');
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING_GOE: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      REGISTERED: 'bg-blue-100 text-blue-700 border-blue-200',
      COMPLETED: 'bg-green-100 text-green-700 border-green-200',
    };
    const labels = {
      PENDING_GOE: 'Aguardando GOE',
      REGISTERED: 'Registrado',
      COMPLETED: 'Concluído',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 fixed h-full">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <span className="ml-3 font-bold text-slate-900">Subst. Escolar</span>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => setActiveTab(item.label.toLowerCase())}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.label.toLowerCase()
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </a>
          ))}
        </nav>

        {/* User Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-slate-600">AD</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">Admin</p>
              <p className="text-xs text-slate-500">adm@adm.com</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Painel da Inspetoria</h1>
            <p className="text-slate-500 mt-1">Gestão de Faltas e Substituições</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
              AD
            </div>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <span className="text-xs text-slate-500">Hoje</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">12</p>
            <p className="text-sm text-slate-500">Faltas Registradas</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-xs text-slate-500">Pendentes</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">5</p>
            <p className="text-sm text-slate-500">Aguardando GOE</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-xs text-slate-500">Hoje</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">8</p>
            <p className="text-sm text-slate-500">Substituições OK</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-xs text-slate-500">Total</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">45</p>
            <p className="text-sm text-slate-500">Professores</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-4 mb-8">
          <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm">
            <Plus className="w-5 h-5" />
            <span>Nova Falta</span>
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-xl border border-slate-200 transition-colors">
            <FileText className="w-5 h-5" />
            <span>Gerar Relatório</span>
          </button>
        </div>

        {/* Substitutions Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Substituições de Hoje</h2>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar..."
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase">Horário</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase">Professor</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase">Disciplina</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase">Substituto</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {todaySubstitutions.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm text-slate-900">{sub.period}</td>
                  <td className="px-6 py-4 text-sm text-slate-900">{sub.teacher}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{sub.subject}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{sub.substitute}</td>
                  <td className="px-6 py-4">{getStatusBadge(sub.status)}</td>
                  <td className="px-6 py-4">
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Ver detalhes
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}