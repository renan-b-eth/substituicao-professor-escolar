'use client';

import { useState, useEffect } from 'react';
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
  BookOpen,
  RefreshCw,
  Eye,
  Check,
  Loader2
} from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

// Types
interface Teacher {
  id: string;
  name: string;
  discipline: string;
  status: string;
}

interface Schedule {
  id: string;
  dayOfWeek: string;
  period: string;
  startTime: string;
  endTime: string;
  className: string;
  discipline: string;
  originalTeacher: Teacher;
  hasSubstitution: boolean;
}

interface Substitution {
  id: string;
  date: string;
  reason: string;
  status: string;
  notes: string;
  originalTeacher: Teacher;
  substituteTeacher: Teacher;
  schedule: Schedule;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const periods = [
  { value: 'MORNING', label: 'Manhã' },
  { value: 'AFTERNOON', label: 'Tarde' },
];

const daysOfWeek = [
  { value: 'MONDAY', label: 'Segunda-feira' },
  { value: 'TUESDAY', label: 'Terça-feira' },
  { value: 'WEDNESDAY', label: 'Quarta-feira' },
  { value: 'THURSDAY', label: 'Quinta-feira' },
  { value: 'FRIDAY', label: 'Sexta-feira' },
];

const reasons = [
  { value: 'SICK', label: 'Licença Médica' },
  { value: 'PERSONAL_LEAVE', label: 'Licença Pessoal' },
  { value: 'TRAINING', label: 'Capacitação' },
  { value: 'OTHER', label: 'Outro' },
];

export default function DashboardPage() {
  // Auth state
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Data state
  const [substitutions, setSubstitutions] = useState<Substitution[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  // UI state
  const [busca, setBusca] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSub, setSelectedSub] = useState<Substitution | null>(null);
  const [activeTab, setActiveTab] = useState('faltas');
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [newSub, setNewSub] = useState({
    scheduleId: '',
    substituteTeacherId: '',
    reason: 'SICK',
    notes: '',
  });

  // Initialize auth
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      fetchData(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  // API helper
  const api = () => {
    return axios.create({
      baseURL: API_URL,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  };

  // Fetch all data
  const fetchData = async (authToken: string) => {
    try {
      const apiClient = axios.create({
        baseURL: API_URL,
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      // Fetch substitutions, teachers, and schedules in parallel
      const [subsRes, teachersRes, schedulesRes] = await Promise.all([
        apiClient.get('/substitutions/today'),
        apiClient.get('/teachers'),
        apiClient.get('/schedules'),
      ]);

      setSubstitutions(subsRes.data.data || []);
      setTeachers(teachersRes.data.data || []);
      setSchedules(schedulesRes.data.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const handleCreateSubstitution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setSubmitting(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await api().post('/substitutions', {
        ...newSub,
        date: today,
      });

      if (response.data.success) {
        // Refresh data
        await fetchData(token);
        setShowNewModal(false);
        setNewSub({ scheduleId: '', substituteTeacherId: '', reason: 'SICK', notes: '' });
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao criar substituição');
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewDetails = (sub: Substitution) => {
    setSelectedSub(sub);
    setShowDetailsModal(true);
  };

  const handleApproveGOE = async (substitutionId: string) => {
    if (!token) return;

    setSubmitting(true);
    try {
      await api().post(`/substitutions/${substitutionId}/register`, {});
      await fetchData(token);
      setShowDetailsModal(false);
    } catch (error) {
      console.error('Error approving:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteSubstitution = async (substitutionId: string) => {
    if (!token) return;

    setSubmitting(true);
    try {
      await api().post(`/substitutions/${substitutionId}/complete`, {});
      await fetchData(token);
      setShowDetailsModal(false);
    } catch (error) {
      console.error('Error completing:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Stats
  const stats = {
    total: substitutions.length,
    pending: substitutions.filter(s => s.status === 'PENDING_GOE').length,
    registered: substitutions.filter(s => s.status === 'REGISTERED').length,
    completed: substitutions.filter(s => s.status === 'COMPLETED').length,
    totalTeachers: teachers.length,
  };

  // Filter substitutions
  const filteredSubstitutions = substitutions.filter(s => {
    if (!busca) return true;
    const lower = busca.toLowerCase();
    return (
      s.originalTeacher?.name?.toLowerCase().includes(lower) ||
      s.substituteTeacher?.name?.toLowerCase().includes(lower) ||
      s.schedule?.discipline?.toLowerCase().includes(lower)
    );
  });

  // Get available schedules (without substitution)
  const availableSchedules = schedules.filter(s => !s.hasSubstitution && s.originalTeacher);

  // Get status badge
  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-700 border-gray-200',
      PENDING_GOE: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      REGISTERED: 'bg-blue-100 text-blue-700 border-blue-200',
      COMPLETED: 'bg-green-100 text-green-700 border-green-200',
      CANCELLED: 'bg-red-100 text-red-700 border-red-200',
    };
    const labels: Record<string, string> = {
      DRAFT: 'Rascunho',
      PENDING_GOE: 'Aguardando GOE',
      REGISTERED: 'Registrado',
      COMPLETED: 'Concluído',
      CANCELLED: 'Cancelado',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status] || ''}`}>
        {labels[status] || status}
      </span>
    );
  };

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  // Get period label
  const getPeriodLabel = (period: string) => {
    return period === 'MORNING' ? 'Manhã' : 'Tarde';
  };

  // Menu items
  const menuItems = [
    { icon: ClipboardList, label: 'Faltas', href: '#faltas', active: activeTab === 'faltas' },
    { icon: Users, label: 'Professores', href: '#professores', active: activeTab === 'professores' },
    { icon: FileText, label: 'Relatórios', href: '#relatorios', active: activeTab === 'relatorios' },
    { icon: Settings, label: 'Configurações', href: '#configuracoes', active: activeTab === 'configuracoes' },
  ];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!token || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Você precisa fazer login</p>
          <a href="/login" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 fixed h-full">
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
              onClick={(e) => {
                e.preventDefault();
                setActiveTab(item.label.toLowerCase());
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                item.active
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
              <span className="text-sm font-medium text-slate-600">
                {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">{user.name}</p>
              <p className="text-xs text-slate-500">{user.role}</p>
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
            <h1 className="text-2xl font-bold text-slate-900">
              {user.role === 'INSPECTOR' ? 'Painel da Inspetoria' : 
               user.role === 'GOE' ? 'Painel GOE' : 
               user.role === 'DIRECTOR' ? 'Painel da Diretoria' : 
               'Dashboard'}
            </h1>
            <p className="text-slate-500 mt-1">
              {user.role === 'INSPECTOR' ? 'Gestão de Faltas e Substituições' :
               user.role === 'GOE' ? 'Validação e Registro de Substituições' :
               user.role === 'DIRECTOR' ? 'Visão Geral e Relatórios' :
               'Gestão Escolar'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => fetchData(token)}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
              title="Atualizar"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
              {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
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
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-xs text-slate-500">Pendente</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats.pending}</p>
            <p className="text-sm text-slate-500">Aguardando GOE</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-xs text-slate-500">Hoje</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats.registered + stats.completed}</p>
            <p className="text-sm text-slate-500">Substituições OK</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-xs text-slate-500">Total</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats.totalTeachers}</p>
            <p className="text-sm text-slate-500">Professores</p>
          </div>
        </div>

        {/* Quick Actions - Only for INSPECTOR */}
        {user.role === 'INSPECTOR' && (
          <div className="flex gap-4 mb-8">
            <button 
              onClick={() => setShowNewModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" />
              <span>Nova Falta</span>
            </button>
            <a 
              href={`${API_URL}/reports/daily-substitutions/pdf`}
              target="_blank"
              className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-xl border border-slate-200 transition-colors"
            >
              <FileText className="w-5 h-5" />
              <span>Gerar Relatório PDF</span>
            </a>
          </div>
        )}

        {/* Main Content Tabs */}
        {activeTab === 'faltas' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Substituições de Hoje</h2>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar professor, disciplina..."
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
                      Nenhuma substituição encontrada hoje
                    </td>
                  </tr>
                ) : (
                  filteredSubstitutions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-900">
                          {sub.schedule?.startTime || '-'}
                        </div>
                        <div className="text-xs text-slate-500">
                          {getPeriodLabel(sub.schedule?.period)} - {sub.schedule?.className}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900">
                        {sub.originalTeacher?.name || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {sub.schedule?.discipline || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {sub.substituteTeacher?.name || '-'}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(sub.status)}
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => handleViewDetails(sub)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          Ver detalhes
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'professores' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Professores</h2>
              <span className="text-sm text-slate-500">{teachers.length} professores</span>
            </div>
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase">Nome</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase">Disciplina</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm text-slate-900">{teacher.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{teacher.discipline}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        teacher.status === 'ACTIVE' 
                          ? 'bg-green-100 text-green-700 border border-green-200' 
                          : 'bg-gray-100 text-gray-700 border border-gray-200'
                      }`}>
                        {teacher.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'relatorios' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Relatórios</h2>
            <div className="grid grid-cols-2 gap-4">
              <a 
                href={`${API_URL}/reports/daily-substitutions/pdf`}
                target="_blank"
                className="p-6 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <FileText className="w-8 h-8 text-blue-600 mb-3" />
                <h3 className="font-medium text-slate-900">Relatório do Dia</h3>
                <p className="text-sm text-slate-500">PDF com todas as substituições de hoje</p>
              </a>
              <button className="p-6 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-left">
                <FileText className="w-8 h-8 text-green-600 mb-3" />
                <h3 className="font-medium text-slate-900">Relatório Mensal</h3>
                <p className="text-sm text-slate-500">Resumo de substituições do mês</p>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Modal Nova Falta */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">Nova Substituição</h3>
              <button onClick={() => setShowNewModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleCreateSubstitution} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Aula (Horário / Disciplina)</label>
                <select
                  value={newSub.scheduleId}
                  onChange={(e) => setNewSub({ ...newSub, scheduleId: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Selecione a aula...</option>
                  {availableSchedules.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.startTime} - {s.discipline} ({s.className}) - {s.originalTeacher?.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Professor Substituto</label>
                <select
                  value={newSub.substituteTeacherId}
                  onChange={(e) => setNewSub({ ...newSub, substituteTeacherId: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Selecione o substituto...</option>
                  {teachers.filter(t => t.status === 'ACTIVE').map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.discipline})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Motivo</label>
                <select
                  value={newSub.reason}
                  onChange={(e) => setNewSub({ ...newSub, reason: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {reasons.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Observações</label>
                <textarea
                  value={newSub.notes}
                  onChange={(e) => setNewSub({ ...newSub, notes: e.target.value })}
                  placeholder="Observações adicionais (opcional)"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
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
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {submitting ? 'Salvando...' : 'Salvar'}
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
                  <p className="text-xs text-slate-500">Data</p>
                  <p className="text-sm font-medium text-slate-900">{formatDate(selectedSub.date)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <Clock className="w-5 h-5 text-slate-500" />
                <div>
                  <p className="text-xs text-slate-500">Horário</p>
                  <p className="text-sm font-medium text-slate-900">
                    {selectedSub.schedule?.startTime} - {selectedSub.schedule?.endTime}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <User className="w-5 h-5 text-red-500" />
                <div>
                  <p className="text-xs text-slate-500">Professor Faltante</p>
                  <p className="text-sm font-medium text-slate-900">{selectedSub.originalTeacher?.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <BookOpen className="w-5 h-5 text-slate-500" />
                <div>
                  <p className="text-xs text-slate-500">Disciplina</p>
                  <p className="text-sm font-medium text-slate-900">{selectedSub.schedule?.discipline}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <User className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-xs text-slate-500">Professor Substituto</p>
                  <p className="text-sm font-medium text-slate-900">{selectedSub.substituteTeacher?.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <AlertCircle className="w-5 h-5 text-slate-500" />
                <div>
                  <p className="text-xs text-slate-500">Motivo</p>
                  <p className="text-sm font-medium text-slate-900">
                    {reasons.find(r => r.value === selectedSub.reason)?.label || selectedSub.reason}
                  </p>
                </div>
              </div>
              <div className="pt-2">
                <p className="text-xs text-slate-500 mb-2">Status</p>
                {getStatusBadge(selectedSub.status)}
              </div>
              {selectedSub.notes && (
                <div className="pt-2">
                  <p className="text-xs text-slate-500 mb-1">Observações</p>
                  <p className="text-sm text-slate-700">{selectedSub.notes}</p>
                </div>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              {/* GOE can register */}
              {user.role === 'GOE' && selectedSub.status === 'PENDING_GOE' && (
                <button
                  onClick={() => handleApproveGOE(selectedSub.id)}
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                  Registrar Substituição
                </button>
              )}
              
              {/* Inspector can complete */}
              {user.role === 'INSPECTOR' && selectedSub.status === 'REGISTERED' && (
                <button
                  onClick={() => handleCompleteSubstitution(selectedSub.id)}
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                  Concluir Substituição
                </button>
              )}
              
              <button
                onClick={() => setShowDetailsModal(false)}
                className="w-full px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}