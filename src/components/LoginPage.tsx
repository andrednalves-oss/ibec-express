import { useState } from 'react';
import { User } from '../types';
import { Truck, Eye, EyeOff, Loader2, Database, Wifi, WifiOff, LogIn } from 'lucide-react';
import { useAuth } from '../hooks/useSupabase';
import { isSupabaseConfigured } from '../lib/supabase';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading, error: authError } = useAuth();
  const [localError, setLocalError] = useState('');
  const dbConnected = isSupabaseConfigured();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setLocalError('Preencha todos os campos');
      return;
    }
    setLocalError('');
    
    const user = await login(email, password);
    if (user) {
      onLogin(user);
    }
  };

  const displayError = localError || authError;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-2xl shadow-orange-500/30 mb-4">
            <Truck size={40} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">IBEC <span className="text-orange-500">EXPRESS</span></h1>
          <p className="text-slate-400 mt-2 text-sm">Sistema de Gestão de Transportes</p>
        </div>

        {/* DB Status Badge */}
        <div className="flex justify-center mb-6">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium ${
            dbConnected 
              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
              : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
          }`}>
            {dbConnected ? (
              <>
                <Wifi size={14} />
                <Database size={14} />
                Conectado ao Supabase
              </>
            ) : (
              <>
                <WifiOff size={14} />
                <Database size={14} />
                Modo Offline
              </>
            )}
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-6">
            <h2 className="text-white text-xl font-semibold">Acesse sua conta</h2>
            <p className="text-slate-400 text-sm mt-1">Entre com suas credenciais para continuar</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-sm text-slate-300 mb-1.5 block font-medium">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
              />
            </div>
            <div>
              <label className="text-sm text-slate-300 mb-1.5 block font-medium">Senha</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all pr-12"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {displayError && (
              <p className="text-red-400 text-sm text-center bg-red-400/10 py-2.5 rounded-xl border border-red-400/20">
                {displayError}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Autenticando...
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  Entrar no Sistema
                </>
              )}
            </button>
          </form>

          <p className="text-slate-500 text-xs text-center mt-5">
            {dbConnected 
              ? 'Autenticação via Supabase • Dados persistentes'
              : 'Use: admin@ibecexpress.com.br / admin123'
            }
          </p>
        </div>

        <p className="text-slate-600 text-xs text-center mt-6">
          © 2024 IBEC EXPRESS - Todos os direitos reservados
        </p>
      </div>
    </div>
  );
}
