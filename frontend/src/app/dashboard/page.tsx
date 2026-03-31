'use client';

import { useState, useMemo } from 'react';
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
  AlertCircle,
  X,
  Calendar,
  User,
  BookOpen
} from 'lucide-react';

const menuItems = [
  { icon: ClipboardList, label: 'Faltas', href: '#faltas', active: true },
  { icon: Users, label: 'Professores', href: '#professores' },
  { icon: FileText, label: 'Relatórios', href: '#relatorios' },
  { icon: Settings, label: 'Configurações', href: '#configuracoes' },
];

// Tipos
interface Substitution {
  id: number;
  teacher: string;
  subject: string;
  period: string;
  substitute: string;
  status: 'PENDING_GOE' | 'REGISTERED' | 'COMPLETED';
  reason?: string;
}

// Mock data inicial
const initialSubstitutions: Substitution[] = [
  { id: 1, teacher: 'Maria Santos', subject: 'Matemática', period: '1º Aula (07:30)', substitute: 'João Silva', status: 'PENDING_GOE', reason: 'Licença Médica' },
  { id: 2, teacher: 'Pedro Oliveira', subject: 'História', period: '3º Aula (09:30)', substitute: 'Ana Costa', status: 'REGISTERED', reason: 'Curso' },
  { id: 3, teacher: 'Julia Ferreira', subject: 'Português', period: '5º Aula (13:30)', substitute: 'Carlos Lima', status: 'COMPLETED', reason: 'Licença Pessoal' },
];

const periods = [
  '1º Aula (07:30 - 08:20)',
  '2º Aula (08:20 - 09:10)',
  '3º Aula (09:10 - 10:00)',
  '4º Aula (10:20 - 11:10)',
  '5º Aula (11:10 - 12:00)',
  '6º Aula (13:00 - 13:50)',
  '7º Aula (13:50 - 14:40)',
  '8º Aula (14:40 - 15:30)',
];

export default function DashboardPage() {
  // Estados
  const [substitutions, setSubstitutions] = useState<Substitution[]>(initialSubstitutions);
  const [busca, setBusca] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSub, setSelectedSub] = useState<Substitution | null>(null);
  const [activeTab, setActiveTab] = useState('faltas');

  // Formulário de nova falta
  const [newSub, setNewSub] = useState({
    period: '',
    teacher: '',
    subject: '',
    substitute: '',
    reason: 'Licença Médica',
  });

  // Stats calculados dinamicamente
  const stats = useMemo(() => {
    const total = substitutions.length;
    const pending = substitutions.filter(s => s.status === 'PENDING_GOE').length;
    const completed = substitutions.filter(s => s.status === 'REGISTERED' || s.status === 'COMPLETED').length;
    return { total, pending, completed };
  }, [substitutions]);

  // Filtragem
  const filteredSubstitutions = useMemo(() => {
    if (!busca) return substitutions;
    const lower = busca.toLowerCase();
    return substitutions.filter(s => 
      s.teacher.toLowerCase().includes(lower) ||
      s.subject.toLowerCase().includes(lower) ||
      s.substitute.toLowerCase().includes(lower)
    );
  }, [substitutions, busca]);

  // Handlers
  const handleLogout = () => {
    window.location.href = '/';
  };

  const handleGenerateReport = () => {
    window.print();
  };

  const handleAddNew = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = Math.max(...substitutions.map(s => s.id)) + 1;
    const newSubstitution: Substitution = {
      id: newId,
      teacher: newSub.teacher,
      subject: newSub.subject,
      period: newSub.period,
      substitute: newSub.substitute,
      status: 'PENDING_GOE',
      reason: newSub.reason,
    };
    setSubstitutions([newSubstitution, ...substitutions]);
    setShowNewModal(false);
    setNewSub({ period: '', teacher: '', subject: '', substitute: '', reason: 'Licença Médica' });
  };

  const handleViewDetails = (sub: Substitution) => {
    setSelectedSub(sub);
    setShowDetailsModal(true);
  };

  const handleSimulateGOEApproval = () => {
    if (!selectedSub) return;
    setSubstitutions(substitutions.map(s => 
      s.id === selectedSub.id ? { ...s, status: 'COMPLETED' } : s
    ));
    setSelectedSub({ ...selectedSub, status: 'COMPLETED' });
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
      <aside className="w-64 bg-white border-r border-slate-200 fixed h-full print:hidden">
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <span className="ml-3 font-bold text-slate-900">Subst. Escolar</span>
        </div>

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
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Painel da Inspetoria</h1>
            <p className="text-slate-500 mt-1">Gestão de Faltas e Substituições</p>
          </div>
          <div className="flex items-center gap-4 print:hidden">
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
            <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
            <p className="text-sm text-slate-500">Faltas Registradas</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-xs text-slate-500">Pendentes</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats.pending}</p>
            <p className="text-sm text-slate-500">Aguardando GOE</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-xs text-slate-500">Hoje</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats.completed}</p>
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
        <div className="flex gap-4 mb-8 print:hidden">
          <button 
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            <span>Nova Falta</span>
          </button>
          <button 
            onClick={handleGenerateReport}
            className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-xl border border-slate-200 transition-colors"
          >
            <FileText className="w-5 h-5" />
            <span>Gerar Relatório</span>
          </button>
        </div>

        {/* Substitutions Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Substituições de Hoje</h2>
            <div className="relative print:hidden">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
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
              {filteredSubstitutions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    Nenhuma substituição encontrada
                  </td>
                </tr>
              ) : (
                filteredSubstitutions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm text-slate-900">{sub.period}</td>
                    <td className="px-6 py-4 text-sm text-slate-900">{sub.teacher}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{sub.subject}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{sub.substitute}</td>
                    <td className="px-6 py-4">{getStatusBadge(sub.status)}</td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleViewDetails(sub)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Ver detalhes
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal Nova Falta */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">Nova Falta</h3>
              <button onClick={() => setShowNewModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddNew} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Horário</label>
                <select
                  value={newSub.period}
                  onChange={(e) => setNewSub({ ...newSub, period: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Selecione...</option>
                  {periods.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Professor Faltante</label>
                <input
                  type="text"
                  value={newSub.teacher}
                  onChange={(e) => setNewSub({ ...newSub, teacher: e.target.value })}
                  placeholder="Nome do professor"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Disciplina</label>
                <input
                  type="text"
                  value={newSub.subject}
                  onChange={(e) => setNewSub({ ...newSub, subject: e.target.value })}
                  placeholder="Matéria"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Professor Substituto</label>
                <input
                  type="text"
                  value={newSub.substitute}
                  onChange={(e) => setNewSub({ ...newSub, substitute: e.target.value })}
                  placeholder="Nome do substituto"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Motivo</label>
                <select
                  value={newSub.reason}
                  onChange={(e) => setNewSub({ ...newSub, reason: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>Licença Médica</option>
                  <option>Licença Pessoal</option>
                  <option>Curso</option>
                  <option>Outro</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detalhes */}
      {showDetailsModal && selectedSub && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">Detalhes da Substituição</h3>
              <button onClick={() => setShowDetailsModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <Calendar className="w-5 h-5 text-slate-500" />
                <div>
                  <p className="text-xs text-slate-500">Horário</p>
                  <p className="text-sm font-medium text-slate-900">{selectedSub.period}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <User className="w-5 h-5 text-slate-500" />
                <div>
                  <p className="text-xs text-slate-500">Professor Faltante</p>
                  <p className="text-sm font-medium text-slate-900">{selectedSub.teacher}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <BookOpen className="w-5 h-5 text-slate-500" />
                <div>
                  <p className="text-xs text-slate-500">Disciplina</p>
                  <p className="text-sm font-medium text-slate-900">{selectedSub.subject}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <User className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-xs text-slate-500">Professor Substituto</p>
                  <p className="text-sm font-medium text-slate-900">{selectedSub.substitute}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <Clock className="w-5 h-5 text-slate-500" />
                <div>
                  <p className="text-xs text-slate-500">Motivo</p>
                  <p className="text-sm font-medium text-slate-900">{selectedSub.reason}</p>
                </div>
              </div>
              <div className="pt-2">
                <p className="text-xs text-slate-500 mb-2">Status</p>
                {getStatusBadge(selectedSub.status)}
              </div>
            </div>
            
            {/* Botão Simular GOE */}
            {selectedSub.status === 'PENDING_GOE' && (
              <button
                onClick={handleSimulateGOEApproval}
                className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <CheckCircle className="w-5 h-5" />
                Simular Aprovação GOE
              </button>
            )}
            
            <button
              onClick={() => setShowDetailsModal(false)}
              className="w-full mt-3 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}