import { useState } from 'react';
import { User, UserRole } from '../types';
import { 
  LayoutDashboard, Package, Truck, Users, DollarSign, LogOut, 
  Menu, X, ChevronRight, Bell, Search, Rocket, Settings
} from 'lucide-react';
import { SupabaseStatus } from './SupabaseSetup';
import { DeployGuide } from './DeployGuide';

export type Page = 'dashboard' | 'deliveries' | 'drivers' | 'clients' | 'financial' | 'settings';

interface LayoutProps {
  user: User;
  currentPage: Page;
  onPageChange: (page: Page) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

const menuItems: { id: Page; label: string; icon: React.ReactNode; roles: UserRole[] }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, roles: ['admin', 'operacional', 'cliente', 'colaborador'] },
  { id: 'deliveries', label: 'Entregas', icon: <Package size={20} />, roles: ['admin', 'operacional', 'cliente', 'colaborador'] },
  { id: 'drivers', label: 'Motoristas', icon: <Truck size={20} />, roles: ['admin', 'operacional'] },
  { id: 'clients', label: 'Clientes', icon: <Users size={20} />, roles: ['admin', 'operacional'] },
  { id: 'financial', label: 'Financeiro', icon: <DollarSign size={20} />, roles: ['admin'] },
  { id: 'settings', label: 'Configurações', icon: <Settings size={20} />, roles: ['admin'] },
];

const roleLabels: Record<UserRole, string> = {
  admin: 'Administrador',
  operacional: 'Operacional',
  cliente: 'Cliente',
  colaborador: 'Colaborador',
};

const roleBadgeColors: Record<UserRole, string> = {
  admin: 'bg-amber-500/20 text-amber-400',
  operacional: 'bg-blue-500/20 text-blue-400',
  cliente: 'bg-emerald-500/20 text-emerald-400',
  colaborador: 'bg-purple-500/20 text-purple-400',
};

export function Layout({ user, currentPage, onPageChange, onLogout, children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showDeployGuide, setShowDeployGuide] = useState(false);
  const filteredMenu = menuItems.filter(item => item.roles.includes(user.role));

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-slate-900 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} flex flex-col`}>
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
              <Truck size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg tracking-tight">IBEC <span className="text-orange-500">EXPRESS</span></h1>
              <p className="text-slate-500 text-xs">Sistema de Gestão</p>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden ml-auto text-slate-400 hover:text-white">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold px-3 mb-3">Menu Principal</p>
          {filteredMenu.map((item) => (
            <button
              key={item.id}
              onClick={() => { onPageChange(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                currentPage === item.id
                  ? 'bg-orange-500/20 text-orange-400'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className={currentPage === item.id ? 'text-orange-400' : 'text-slate-500 group-hover:text-slate-300'}>{item.icon}</span>
              {item.label}
              {currentPage === item.id && <ChevronRight size={16} className="ml-auto" />}
            </button>
          ))}
        </nav>

        {/* Deploy Guide Button */}
        {user.role === 'admin' && (
          <div className="px-4 pb-2">
            <button
              onClick={() => setShowDeployGuide(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all bg-gradient-to-r from-orange-500/10 to-orange-600/10 text-orange-400 hover:from-orange-500/20 hover:to-orange-600/20 border border-orange-500/20"
            >
              <Rocket size={18} />
              Guia de Deploy
            </button>
          </div>
        )}

        {/* User info */}
        <div className="p-4 border-t border-white/10">
          <div className="bg-white/5 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{user.name}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${roleBadgeColors[user.role]}`}>
                  {roleLabels[user.role]}
                </span>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="mt-3 w-full flex items-center justify-center gap-2 py-2 text-sm text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
            >
              <LogOut size={16} />
              Sair do Sistema
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-200 px-4 lg:px-8 py-4 flex items-center gap-4 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-600 hover:text-slate-900">
            <Menu size={24} />
          </button>
          
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar entregas, motoristas..." 
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <SupabaseStatus />
            <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full" />
            </button>
            <div className="hidden sm:flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                {user.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">{user.name}</p>
                <p className="text-xs text-slate-400">{roleLabels[user.role]}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </main>
      </div>

      {/* Deploy Guide Modal */}
      {showDeployGuide && <DeployGuide onClose={() => setShowDeployGuide(false)} />}
    </div>
  );
}
