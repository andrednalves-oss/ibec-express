import { useState } from 'react';
import { Database, X, Copy, Check, ExternalLink, Wifi, WifiOff } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

export function SupabaseStatus() {
  const [showGuide, setShowGuide] = useState(false);
  const [copied, setCopied] = useState(false);
  const connected = isSupabaseConfigured();

  const handleCopy = () => {
    const envContent = `VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co\nVITE_SUPABASE_ANON_KEY=SUA-CHAVE-ANONIMA`;
    navigator.clipboard.writeText(envContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <button
        onClick={() => setShowGuide(true)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
          connected
            ? 'bg-green-50 text-green-700 hover:bg-green-100'
            : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 animate-pulse'
        }`}
      >
        {connected ? <Wifi size={14} /> : <WifiOff size={14} />}
        <Database size={14} />
        {connected ? 'Supabase Conectado' : 'Modo Offline'}
      </button>

      {showGuide && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${connected ? 'bg-green-100' : 'bg-yellow-100'}`}>
                  <Database size={20} className={connected ? 'text-green-600' : 'text-yellow-600'} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Configuração do Banco de Dados</h2>
                  <p className="text-sm text-slate-500">
                    {connected ? '✅ Supabase conectado e funcionando' : '⚠️ Usando dados locais (mockados)'}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowGuide(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {connected ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="text-green-800 font-medium">🎉 Banco de dados configurado com sucesso!</p>
                  <p className="text-green-700 text-sm mt-1">Todos os dados estão sendo persistidos no Supabase.</p>
                </div>
              ) : (
                <>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <p className="text-yellow-800 font-medium">⚠️ Supabase não configurado</p>
                    <p className="text-yellow-700 text-sm mt-1">O sistema está funcionando com dados em memória. Ao recarregar a página, os dados serão perdidos.</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-900 mb-3">📋 Passo a passo para configurar:</h3>
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 font-bold text-sm shrink-0">1</div>
                        <div>
                          <p className="font-medium text-slate-900">Criar projeto no Supabase</p>
                          <p className="text-sm text-slate-500">Acesse supabase.com e crie um novo projeto gratuito</p>
                          <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700 mt-1">
                            Abrir Supabase <ExternalLink size={14} />
                          </a>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 font-bold text-sm shrink-0">2</div>
                        <div>
                          <p className="font-medium text-slate-900">Executar o SQL de criação</p>
                          <p className="text-sm text-slate-500">No SQL Editor do Supabase, execute o conteúdo do arquivo <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">SUPABASE_SETUP.sql</code></p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 font-bold text-sm shrink-0">3</div>
                        <div>
                          <p className="font-medium text-slate-900">Configurar variáveis de ambiente</p>
                          <p className="text-sm text-slate-500 mb-2">Crie um arquivo <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">.env</code> na raiz do projeto:</p>
                          <div className="bg-slate-900 rounded-xl p-4 relative">
                            <button onClick={handleCopy} className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10">
                              {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                            </button>
                            <pre className="text-green-400 text-sm font-mono">
{`VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=SUA-CHAVE-ANONIMA`}
                            </pre>
                          </div>
                          <p className="text-xs text-slate-400 mt-2">
                            Encontre estas informações em: Supabase → Settings → API
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 font-bold text-sm shrink-0">4</div>
                        <div>
                          <p className="font-medium text-slate-900">Reiniciar o servidor</p>
                          <p className="text-sm text-slate-500">Após configurar o .env, reinicie o servidor de desenvolvimento</p>
                          <div className="bg-slate-900 rounded-xl p-3 mt-2">
                            <pre className="text-green-400 text-sm font-mono">npm run dev</pre>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="bg-slate-50 rounded-xl p-4">
                <h4 className="font-medium text-slate-900 mb-2">📊 Tabelas do Sistema:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" /> users (usuários)
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <div className="w-2 h-2 bg-orange-500 rounded-full" /> drivers (motoristas)
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full" /> clients (clientes)
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <div className="w-2 h-2 bg-purple-500 rounded-full" /> deliveries (entregas)
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full" /> financial_entries (financeiro)
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <div className="w-2 h-2 bg-red-500 rounded-full" /> payroll (folha)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
