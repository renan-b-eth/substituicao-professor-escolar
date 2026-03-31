'use client';

import Link from 'next/link';
import { GraduationCap, FileText, Users, LayoutDashboard, ArrowRight, ExternalLink } from 'lucide-react';

const projects = [
  {
    title: 'Rendey Class',
    description: 'Plataforma educacional focada em ferramentas para professores, com gestão de aulas, notas e comunicados.',
    icon: GraduationCap,
    link: '#',
  },
  {
    title: 'ScrollCaro',
    description: 'Automação inteligente e soluções de IA para otimizar processos empresariais e aumentar a produtividade.',
    icon: FileText,
    link: 'https://scroll-caro.vercel.app/',
  },
  {
    title: 'Sistema de Controle Nancy',
    description: 'Sistema completo de gestão escolar para escolas estaduais, incluindo frequência, notas e relatórios.',
    icon: Users,
    link: 'https://sistema-controle-nancy.vercel.app/',
  },
  {
    title: 'Renan Bezerra',
    description: 'Portfólio pessoal showcasing projetos, habilidades e experiência como desenvolvedor full-stack.',
    icon: LayoutDashboard,
    link: 'https://site-renanbezerra.vercel.app/',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">Substituição Escolar</span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/login" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">
                Login
              </Link>
              <Link href="/dashboard" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">
                Dashboard
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 lg:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              Sistema Multi-Tenant para Escolas
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              Sistema de Substituição
              <span className="block text-blue-600">Escolar</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10">
              Gestão inteligente, rápida e sem burocracia de faltas e substituições de professores para a rede estadual de ensino.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/login"
                className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                <span>Acessar Sistema (Login)</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                href="/dashboard"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-700 font-semibold rounded-xl border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200"
              >
                <span>Ver Dashboard Público</span>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Escolas Atendidas', value: '50+' },
              { label: 'Professores', value: '1.200+' },
              { label: 'Substituições/Mês', value: '5.000+' },
              { label: 'Taxa de Resolução', value: '99%' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">{stat.value}</div>
                <div className="text-slate-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Por que usar nosso sistema?
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Uma solução completa para a gestão de substituições escolares
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: 'Multi-Tenant',
                description: 'Cada escola tem seu ambiente isolado e seguro com gerenciamento independente.',
              },
              {
                icon: FileText,
                title: 'Fluxo Automatizado',
                description: 'Do registro da falta até a confirmação da substituição, tudo flui automaticamente.',
              },
              {
                icon: LayoutDashboard,
                title: 'Relatórios em PDF',
                description: 'Geração automática de relatórios e comprovantes para impressão.',
              },
            ].map((feature, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-100"
              >
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              conheça nossas outras soluções
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Projetos desenvolvidos para transformar a educação e negócios
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {projects.map((project, index) => (
              <a
                key={index}
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 hover:border-blue-300 flex flex-col"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <project.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{project.title}</h3>
                <p className="text-slate-600 text-sm mb-4 flex-grow">{project.description}</p>
                <div className="inline-flex items-center gap-2 text-blue-600 font-medium text-sm group-hover:gap-3 transition-all">
                  <span>Visitar</span>
                  <ExternalLink className="w-4 h-4" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Pronto para modernizar sua gestão escolar?
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            Comece agora mesmo e facilite o dia a dia da sua equipe.
          </p>
          <Link 
            href="/login"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-all duration-200 shadow-lg"
          >
            <span>Entrar no Sistema</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-semibold">Substituição Escolar</span>
            </div>
            <p className="text-slate-400 text-sm">
              Desenvolvido por <span className="text-white font-medium">Renan Bezerra</span> © {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}