import React from 'react';
import { 
  Users, MapPin, BarChart3, CreditCard, History, Lock, Unlock, 
  Skull, Menu, X, Database
} from 'lucide-react';
import { Divisao, Member } from '../types';

export type ActiveTab = 'integrantes' | 'divisoes' | 'relatorios' | 'carteirinhas' | 'auditoria';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isAdmin: boolean;
  onOpenAdminAuth: () => void;
  membersCount: number;
  divisoesCount: number;
  caveirasCount: number;
  onOpenAddMember: () => void;
  onOpenCrudTest: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isAdmin,
  onOpenAdminAuth,
  membersCount,
  divisoesCount,
  caveirasCount,
  onOpenAddMember,
  onOpenCrudTest
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'integrantes', label: 'Integrantes', icon: <Users size={16} />, badge: String(membersCount) },
    { id: 'divisoes', label: 'Divisões', icon: <MapPin size={16} />, badge: String(divisoesCount) },
    { id: 'relatorios', label: 'Relatórios & Estatísticas', icon: <BarChart3 size={16} /> },
    { id: 'carteirinhas', label: 'Credenciais', icon: <CreditCard size={16} /> },
    { id: 'auditoria', label: 'Auditoria', icon: <History size={16} /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0d0f14]/95 backdrop-blur-md border-b border-zinc-800/90 shadow-2xl no-print">
      {/* Top Banner with Skull & Metal branding */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-4">
          
          {/* Logo and MC Branding */}
          <div className="flex items-center gap-3.5">
            <div className="relative group cursor-pointer" onClick={() => setActiveTab('integrantes')}>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-b from-red-600 to-red-950 border-2 border-red-500 flex items-center justify-center text-white shadow-lg shadow-red-950/80 transition-transform duration-200 group-hover:scale-105">
                <Skull size={28} className="text-zinc-100 drop-shadow" />
              </div>
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-[#0d0f14]"></span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white font-cinzel tracking-wider leading-none">
                  Gestão Operacional <span className="text-red-500">Sidnei</span>
                </h1>
                <span className="hidden sm:inline-block text-[10px] font-mono uppercase bg-red-950/80 text-red-300 px-2 py-0.5 rounded border border-red-800">
                  Operacional
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-medium tracking-wide">
                Sistema Oficial de Grupamentos & Divisões
              </p>
            </div>
          </div>

          {/* Quick Metrics (Desktop) */}
          <div className="hidden lg:flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2 bg-[#141720] px-3 py-1.5 rounded-lg border border-zinc-800">
              <span className="text-zinc-400">Efetivo:</span>
              <strong className="text-white font-mono font-bold">{membersCount}</strong>
            </div>

            <div className="flex items-center gap-2 bg-[#141720] px-3 py-1.5 rounded-lg border border-zinc-800">
              <span className="text-red-400">Caveiras:</span>
              <strong className="text-red-300 font-mono font-bold">{caveirasCount}</strong>
            </div>

            <div className="flex items-center gap-2 bg-[#141720] px-3 py-1.5 rounded-lg border border-zinc-800">
              <span className="text-zinc-400">Divisões:</span>
              <strong className="text-amber-400 font-mono font-bold">{divisoesCount}</strong>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* CRUD Test Button */}
            <button
              type="button"
              onClick={onOpenCrudTest}
              title="Abrir Painel de Teste de CRUD"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition bg-[#151922] hover:bg-[#1c2230] text-emerald-400 border border-emerald-900/60 shadow-md"
            >
              <Database size={14} className="text-emerald-400" />
              <span className="hidden sm:inline">Teste de CRUD</span>
              <span className="sm:hidden">CRUD</span>
            </button>

            {/* Admin Control Button */}
            <button
              type="button"
              onClick={onOpenAdminAuth}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition border shadow-md ${
                isAdmin
                  ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300 hover:bg-emerald-900'
                  : 'bg-zinc-900 border-zinc-700/80 text-zinc-300 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {isAdmin ? (
                <>
                  <Unlock size={14} className="text-emerald-400" />
                  <span className="hidden sm:inline">Admin Liberado</span>
                  <span className="sm:hidden">Admin</span>
                </>
              ) : (
                <>
                  <Lock size={14} className="text-amber-400" />
                  <span className="hidden sm:inline">Acesso Admin (PIN)</span>
                  <span className="sm:hidden">PIN</span>
                </>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 border-t border-zinc-800/80 py-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                  isActive
                    ? 'bg-red-600 text-white shadow-md shadow-red-950'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    isActive ? 'bg-black/30 text-white' : 'bg-zinc-800 text-zinc-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#11141a] border-b border-zinc-800 px-4 py-3 space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                  isActive
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/40 text-zinc-200 font-mono">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
