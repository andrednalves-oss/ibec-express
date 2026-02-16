import { useState } from 'react';
import {
  Rocket, Server, Database, Globe, Shield, Copy, Check,
  ExternalLink, ChevronRight, Terminal, Cloud, Key,
  Zap, ArrowRight, CheckCircle2, Circle, AlertTriangle,
  Monitor, Smartphone, Lock, RefreshCw, FileCode, X
} from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

interface DeployGuideProps {
  onClose: () => void;
}

type Step = 'overview' | 'supabase' | 'hosting' | 'domain' | 'security';

export function DeployGuide({ onClose }: DeployGuideProps) {
  const [activeStep, setActiveStep] = useState<Step>('overview');
  const [copied, setCopied] = useState<string | null>(null);
  const dbConnected = isSupabaseConfigured();

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const steps: { id: Step; label: string; icon: React.ReactNode; done: boolean }[] = [
    { id: 'overview', label: 'Visão Geral', icon: <Rocket size={18} />, done: true },
    { id: 'supabase', label: 'Banco de Dados', icon: <Database size={18} />, done: dbConnected },
    { id: 'hosting', label: 'Hospedagem', icon: <Cloud size={18} />, done: false },
    { id: 'domain', label: 'Domínio & SSL', icon: <Globe size={18} />, done: false },
    { id: 'security', label: 'Segurança', icon: <Shield size={18} />, done: false },
  ];

  const CodeBlock = ({ code, id, language = 'bash' }: { code: string; id: string; language?: string }) => (
    <div className="bg-slate-900 rounded-xl p-4 relative group mt-2 mb-3">
      <button
        onClick={() => handleCopy(code, id)}
        className="absolute top-3 right-3 p-1.5 text-slate-500 hover:text-white rounded-lg hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all"
        title="Copiar"
      >
        {copied === id ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
      </button>
      <pre className="text-sm font-mono text-green-400 overflow-x-auto whitespace-pre-wrap">
        <code data-language={language}>{code}</code>
      </pre>
    </div>
  );

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-3 mt-6 first:mt-0">
      {children}
    </h3>
  );

  const StepCard = ({ number, title, children, status = 'pending' }: { number: number; title: string; children: React.ReactNode; status?: 'done' | 'pending' | 'warning' }) => (
    <div className={`border rounded-xl p-5 transition-all ${
      status === 'done' ? 'border-green-200 bg-green-50/50' :
      status === 'warning' ? 'border-yellow-200 bg-yellow-50/50' :
      'border-slate-200 bg-white'
    }`}>
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
          status === 'done' ? 'bg-green-500 text-white' :
          status === 'warning' ? 'bg-yellow-500 text-white' :
          'bg-orange-100 text-orange-600'
        }`}>
          {status === 'done' ? <CheckCircle2 size={16} /> : number}
        </div>
        <div>
          <h4 className="font-semibold text-slate-900">{title}</h4>
        </div>
      </div>
      <div className="ml-11 text-sm text-slate-600 space-y-2">
        {children}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                <Rocket size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Guia de Deploy</h2>
                <p className="text-slate-300 text-sm mt-0.5">Tudo que você precisa para colocar o IBEC EXPRESS no ar</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Steps */}
          <div className="w-64 bg-slate-50 border-r border-slate-200 p-4 space-y-1 shrink-0 hidden md:block">
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold px-3 mb-3">Etapas</p>
            {steps.map((step) => (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeStep === step.id
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                    : 'text-slate-600 hover:bg-white hover:shadow-sm'
                }`}
              >
                <span className={activeStep === step.id ? 'text-white' : step.done ? 'text-green-500' : 'text-slate-400'}>
                  {step.done && activeStep !== step.id ? <CheckCircle2 size={18} /> : step.icon}
                </span>
                {step.label}
                {activeStep === step.id && <ChevronRight size={16} className="ml-auto" />}
              </button>
            ))}

            {/* Status */}
            <div className="mt-6 p-4 bg-white rounded-xl border border-slate-200">
              <p className="text-xs font-semibold text-slate-500 uppercase mb-3">Status Atual</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  {dbConnected ? <CheckCircle2 size={16} className="text-green-500" /> : <Circle size={16} className="text-slate-300" />}
                  <span className={dbConnected ? 'text-green-700' : 'text-slate-500'}>Supabase</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Circle size={16} className="text-slate-300" />
                  <span className="text-slate-500">Hospedagem</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Circle size={16} className="text-slate-300" />
                  <span className="text-slate-500">Domínio</span>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile step tabs */}
          <div className="md:hidden flex overflow-x-auto border-b border-slate-200 bg-slate-50 px-2 py-2 gap-1">
            {steps.map((step) => (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  activeStep === step.id ? 'bg-orange-500 text-white' : 'text-slate-500 hover:bg-white'
                }`}
              >
                {step.icon}
                {step.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 lg:p-8">
            {/* ===== OVERVIEW ===== */}
            {activeStep === 'overview' && (
              <div className="space-y-6">
                <SectionTitle>
                  <Rocket size={22} className="text-orange-500" />
                  O que você precisa para colocar no ar
                </SectionTitle>

                <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-6">
                  <h4 className="font-bold text-orange-900 text-lg mb-2">📋 Resumo Rápido</h4>
                  <p className="text-orange-800 text-sm mb-4">Para colocar o IBEC EXPRESS em produção, você precisa de 3 coisas:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white/80 rounded-xl p-4 border border-orange-100">
                      <Database size={24} className="text-blue-500 mb-2" />
                      <h5 className="font-bold text-slate-900">1. Banco de Dados</h5>
                      <p className="text-xs text-slate-500 mt-1">Supabase (gratuito)</p>
                      <p className="text-xs text-green-600 font-medium mt-2">💰 R$ 0/mês</p>
                    </div>
                    <div className="bg-white/80 rounded-xl p-4 border border-orange-100">
                      <Cloud size={24} className="text-purple-500 mb-2" />
                      <h5 className="font-bold text-slate-900">2. Hospedagem</h5>
                      <p className="text-xs text-slate-500 mt-1">Vercel, Netlify ou VPS</p>
                      <p className="text-xs text-green-600 font-medium mt-2">💰 R$ 0/mês (gratuito)</p>
                    </div>
                    <div className="bg-white/80 rounded-xl p-4 border border-orange-100">
                      <Globe size={24} className="text-emerald-500 mb-2" />
                      <h5 className="font-bold text-slate-900">3. Domínio</h5>
                      <p className="text-xs text-slate-500 mt-1">ibecexpress.com.br</p>
                      <p className="text-xs text-orange-600 font-medium mt-2">💰 ~R$ 40/ano</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                  <h4 className="font-bold text-green-900 flex items-center gap-2">
                    <Zap size={18} className="text-green-600" />
                    Custo Total Estimado
                  </h4>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-green-700 font-medium">Opção 1: Gratuita</p>
                      <p className="text-green-600 text-xs mt-1">Supabase Free + Vercel Free + domínio .vercel.app</p>
                      <p className="text-2xl font-bold text-green-700 mt-2">R$ 0/mês</p>
                    </div>
                    <div>
                      <p className="text-green-700 font-medium">Opção 2: Profissional</p>
                      <p className="text-green-600 text-xs mt-1">Supabase Pro + Vercel Pro + domínio próprio</p>
                      <p className="text-2xl font-bold text-green-700 mt-2">~R$ 130/mês</p>
                    </div>
                  </div>
                </div>

                <SectionTitle>
                  <Terminal size={22} className="text-blue-500" />
                  Requisitos Técnicos
                </SectionTitle>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white border border-slate-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Monitor size={18} className="text-slate-500" />
                      <h4 className="font-semibold text-slate-900 text-sm">Para Desenvolver</h4>
                    </div>
                    <ul className="space-y-1.5 text-sm text-slate-600">
                      <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-green-500" /> Node.js 18+</li>
                      <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-green-500" /> npm ou yarn</li>
                      <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-green-500" /> Git</li>
                      <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-green-500" /> VS Code (recomendado)</li>
                    </ul>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Smartphone size={18} className="text-slate-500" />
                      <h4 className="font-semibold text-slate-900 text-sm">Compatibilidade</h4>
                    </div>
                    <ul className="space-y-1.5 text-sm text-slate-600">
                      <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-green-500" /> Desktop (Chrome, Firefox, Edge)</li>
                      <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-green-500" /> Tablet (iPad, Android)</li>
                      <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-green-500" /> Mobile (iOS, Android)</li>
                      <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-green-500" /> PWA Ready</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <AlertTriangle size={20} className="text-blue-500 shrink-0" />
                  <p className="text-sm text-blue-800">
                    <strong>Dica:</strong> Siga as etapas na ordem do menu lateral. Comece pelo banco de dados, depois a hospedagem e por último o domínio.
                  </p>
                </div>
              </div>
            )}

            {/* ===== SUPABASE ===== */}
            {activeStep === 'supabase' && (
              <div className="space-y-5">
                <SectionTitle>
                  <Database size={22} className="text-blue-500" />
                  Configurar o Supabase (Banco de Dados)
                </SectionTitle>

                {dbConnected ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                    <div className="flex items-center gap-2 text-green-700 font-medium">
                      <CheckCircle2 size={20} />
                      Supabase já está configurado e conectado!
                    </div>
                    <p className="text-green-600 text-sm mt-1">Os dados estão sendo persistidos no banco de dados.</p>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-yellow-700 font-medium">
                      <AlertTriangle size={18} />
                      Supabase não configurado
                    </div>
                    <p className="text-yellow-600 text-sm mt-1">O sistema está funcionando com dados em memória (mockados).</p>
                  </div>
                )}

                <StepCard number={1} title="Criar conta no Supabase">
                  <p>Acesse o Supabase e crie uma conta gratuita:</p>
                  <a
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-all mt-2"
                  >
                    <ExternalLink size={14} />
                    Abrir Supabase Dashboard
                  </a>
                  <p className="mt-2 text-xs text-slate-400">O plano gratuito oferece: 500MB de banco, 1GB de storage, 50K autenticações/mês</p>
                </StepCard>

                <StepCard number={2} title="Criar um novo projeto">
                  <p>No dashboard do Supabase, clique em <strong>"New Project"</strong>:</p>
                  <ul className="list-disc ml-4 space-y-1 mt-2">
                    <li>Nome: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono">ibec-express</code></li>
                    <li>Senha do banco: (guarde essa senha!)</li>
                    <li>Região: <strong>South America (São Paulo)</strong></li>
                  </ul>
                </StepCard>

                <StepCard number={3} title="Executar o SQL de criação das tabelas">
                  <p>No Supabase, vá em <strong>SQL Editor</strong> → <strong>New Query</strong> e cole o conteúdo do arquivo:</p>
                  <CodeBlock
                    id="sql-file"
                    language="bash"
                    code="# O arquivo SUPABASE_SETUP.sql está na raiz do projeto
# Copie TODO o conteúdo e cole no SQL Editor do Supabase
# Depois clique em 'Run' para executar"
                  />
                  <p>Este SQL cria todas as 6 tabelas + dados iniciais + políticas de segurança + índices.</p>
                </StepCard>

                <StepCard number={4} title="Obter as credenciais de API">
                  <p>No Supabase, vá em <strong>Settings → API</strong> e copie:</p>
                  <ul className="list-disc ml-4 space-y-1 mt-2">
                    <li><strong>Project URL</strong> — Algo como <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono">https://xxxx.supabase.co</code></li>
                    <li><strong>anon/public key</strong> — Uma chave longa que começa com <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono">eyJ...</code></li>
                  </ul>
                </StepCard>

                <StepCard number={5} title="Criar o arquivo .env">
                  <p>Na raiz do projeto, crie um arquivo <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono">.env</code>:</p>
                  <CodeBlock
                    id="env-file"
                    code={`VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-aqui`}
                  />
                  <p>⚠️ Substitua pelos seus valores reais!</p>
                </StepCard>

                <StepCard number={6} title="Reiniciar e testar">
                  <CodeBlock id="restart" code={`# Pare o servidor (Ctrl+C) e reinicie
npm run dev`} />
                  <p>O badge no sistema deve mudar de "Modo Offline" para <span className="text-green-600 font-medium">"Supabase Conectado"</span>.</p>
                </StepCard>
              </div>
            )}

            {/* ===== HOSTING ===== */}
            {activeStep === 'hosting' && (
              <div className="space-y-5">
                <SectionTitle>
                  <Cloud size={22} className="text-purple-500" />
                  Escolher Hospedagem
                </SectionTitle>

                <p className="text-slate-600">Você tem 3 opções principais para hospedar o sistema. Recomendamos a <strong>Opção 1 (Vercel)</strong> por ser a mais fácil:</p>

                {/* Option 1: Vercel */}
                <div className="border-2 border-orange-200 bg-orange-50/30 rounded-2xl overflow-hidden">
                  <div className="bg-orange-500 text-white px-5 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold">
                      <Zap size={18} />
                      Opção 1: Vercel (⭐ Recomendado)
                    </div>
                    <span className="text-xs bg-white/20 px-2 py-1 rounded-lg">GRATUITO</span>
                  </div>
                  <div className="p-5 space-y-4">
                    <StepCard number={1} title="Subir o código para o GitHub">
                      <CodeBlock id="git-1" code={`# No terminal, na pasta do projeto:
git init
git add .
git commit -m "IBEC EXPRESS - Sistema completo"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/ibec-express.git
git push -u origin main`} />
                    </StepCard>

                    <StepCard number={2} title="Conectar no Vercel">
                      <p>Acesse <strong>vercel.com</strong>, faça login com GitHub e importe o repositório:</p>
                      <a href="https://vercel.com/new" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-all mt-2">
                        <ExternalLink size={14} />
                        Deploy no Vercel
                      </a>
                    </StepCard>

                    <StepCard number={3} title="Configurar variáveis de ambiente">
                      <p>No Vercel → Settings → Environment Variables, adicione:</p>
                      <CodeBlock id="vercel-env" code={`VITE_SUPABASE_URL = https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY = eyJ...sua-chave`} />
                    </StepCard>

                    <StepCard number={4} title="Deploy automático!">
                      <p>O Vercel faz o build automaticamente. A cada <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono">git push</code>, uma nova versão é publicada!</p>
                      <p className="mt-2">Sua URL será algo como: <code className="bg-slate-100 px-2 py-1 rounded text-xs font-mono">ibec-express.vercel.app</code></p>
                    </StepCard>
                  </div>
                </div>

                {/* Option 2: Netlify */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <div className="bg-slate-100 px-5 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-slate-700">
                      <Cloud size={18} />
                      Opção 2: Netlify
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-lg">GRATUITO</span>
                  </div>
                  <div className="p-5 space-y-3 text-sm text-slate-600">
                    <p>Processo similar ao Vercel:</p>
                    <ol className="list-decimal ml-4 space-y-1">
                      <li>Crie conta em <a href="https://netlify.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">netlify.com</a></li>
                      <li>Conecte o repositório GitHub</li>
                      <li>Build command: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono">npm run build</code></li>
                      <li>Publish directory: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono">dist</code></li>
                      <li>Configure as variáveis de ambiente (mesmas do Vercel)</li>
                    </ol>
                  </div>
                </div>

                {/* Option 3: VPS */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <div className="bg-slate-100 px-5 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-slate-700">
                      <Server size={18} />
                      Opção 3: VPS (Servidor Próprio)
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-lg">~R$ 25/mês</span>
                  </div>
                  <div className="p-5 space-y-3 text-sm text-slate-600">
                    <p>Para quem quer controle total. Use DigitalOcean, Contabo ou Hostinger VPS:</p>
                    <CodeBlock id="vps" code={`# No servidor (Ubuntu):
# 1. Instale Node.js e Nginx
sudo apt update && sudo apt install -y nodejs npm nginx

# 2. Clone o projeto
git clone https://github.com/SEU-USUARIO/ibec-express.git
cd ibec-express

# 3. Configure as variáveis
cp .env.example .env
nano .env  # Edite com suas credenciais

# 4. Build
npm install
npm run build

# 5. Copie para Nginx
sudo cp -r dist/* /var/www/html/

# 6. Configure Nginx (SPA routing)
sudo nano /etc/nginx/sites-available/default
# Adicione: try_files $uri $uri/ /index.html;

# 7. Reinicie Nginx
sudo systemctl restart nginx`} />
                  </div>
                </div>
              </div>
            )}

            {/* ===== DOMAIN ===== */}
            {activeStep === 'domain' && (
              <div className="space-y-5">
                <SectionTitle>
                  <Globe size={22} className="text-emerald-500" />
                  Domínio Personalizado & SSL
                </SectionTitle>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                  <h4 className="font-bold text-blue-900">🌐 Por que ter um domínio próprio?</h4>
                  <ul className="mt-2 space-y-1 text-sm text-blue-700">
                    <li>✅ Transmite profissionalismo e credibilidade</li>
                    <li>✅ Mais fácil de compartilhar com clientes</li>
                    <li>✅ SSL gratuito (https) incluído</li>
                    <li>✅ E-mail profissional (@ibecexpress.com.br)</li>
                  </ul>
                </div>

                <StepCard number={1} title="Registrar um domínio">
                  <p>Sugestões de domínio para o IBEC EXPRESS:</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {['ibecexpress.com.br', 'ibecexpress.com', 'ibec.express', 'painel.ibecexpress.com.br'].map(d => (
                      <code key={d} className="bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-700">{d}</code>
                    ))}
                  </div>
                  <p className="mt-3">Onde registrar:</p>
                  <ul className="list-disc ml-4 space-y-1 mt-1">
                    <li><strong>Registro.br</strong> — Domínios .com.br (~R$ 40/ano)</li>
                    <li><strong>Namecheap</strong> — Domínios internacionais (~$10/ano)</li>
                    <li><strong>Cloudflare</strong> — Preço de custo (~$8/ano .com)</li>
                  </ul>
                </StepCard>

                <StepCard number={2} title="Conectar no Vercel/Netlify">
                  <p>Após registrar o domínio:</p>
                  <ol className="list-decimal ml-4 space-y-2 mt-2">
                    <li>No Vercel → Settings → Domains → Add Domain</li>
                    <li>Digite seu domínio (ex: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">painel.ibecexpress.com.br</code>)</li>
                    <li>O Vercel mostrará os registros DNS necessários</li>
                    <li>Configure estes registros no painel do Registro.br</li>
                  </ol>
                </StepCard>

                <StepCard number={3} title="Configurar DNS">
                  <p>Adicione os seguintes registros no Registro.br (ou Cloudflare):</p>
                  <CodeBlock id="dns" code={`Tipo: CNAME
Nome: painel (ou @)
Valor: cname.vercel-dns.com

# OU se usar Netlify:
Tipo: CNAME
Nome: painel
Valor: seu-site.netlify.app`} />
                  <p className="mt-2 text-xs text-slate-400">A propagação do DNS pode levar até 48h, mas geralmente leva poucos minutos.</p>
                </StepCard>

                <StepCard number={4} title="SSL (HTTPS) - Automático!">
                  <p>Se você usar Vercel ou Netlify, o certificado SSL é <strong>gerado automaticamente</strong>. Seu site terá o cadeado 🔒 sem custo adicional.</p>
                  <p className="mt-2">Se usar VPS, use o <strong>Certbot</strong> (Let's Encrypt - gratuito):</p>
                  <CodeBlock id="ssl" code={`sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d painel.ibecexpress.com.br`} />
                </StepCard>
              </div>
            )}

            {/* ===== SECURITY ===== */}
            {activeStep === 'security' && (
              <div className="space-y-5">
                <SectionTitle>
                  <Shield size={22} className="text-red-500" />
                  Segurança & Boas Práticas
                </SectionTitle>

                <div className="bg-red-50 border border-red-200 rounded-xl p-5">
                  <h4 className="font-bold text-red-900 flex items-center gap-2">
                    <Lock size={18} />
                    Antes de ir para produção, verifique estes itens:
                  </h4>
                </div>

                <StepCard number={1} title="Alterar todas as senhas padrão" status="warning">
                  <p>No Supabase SQL Editor, altere a senha padrão '123456' de todos os usuários:</p>
                  <CodeBlock id="pwd" code={`UPDATE users SET password_hash = 'NOVA-SENHA-FORTE' WHERE email = 'admin@ibecexpress.com';`} />
                  <p className="text-red-600 font-medium mt-2">⚠️ NUNCA use a senha '123456' em produção!</p>
                </StepCard>

                <StepCard number={2} title="Implementar hash de senha">
                  <p>Para segurança real, use bcrypt ou argon2 para as senhas. Considere migrar para o <strong>Supabase Auth</strong> que gerencia autenticação automaticamente.</p>
                </StepCard>

                <StepCard number={3} title="Configurar Row Level Security (RLS)">
                  <p>O SQL de setup já habilita RLS com políticas permissivas. Para produção, restrinja por role:</p>
                  <CodeBlock id="rls" code={`-- Exemplo: Clientes só veem suas próprias entregas
CREATE POLICY "Clients see own deliveries" 
  ON deliveries FOR SELECT 
  USING (client_id = auth.uid());`} />
                </StepCard>

                <StepCard number={4} title="Variáveis de ambiente seguras">
                  <ul className="list-disc ml-4 space-y-1">
                    <li>NUNCA commit o arquivo <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">.env</code> no Git</li>
                    <li>Adicione <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">.env</code> ao <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">.gitignore</code></li>
                    <li>Use as variáveis de ambiente do Vercel/Netlify para produção</li>
                  </ul>
                  <CodeBlock id="gitignore" code={`# .gitignore
.env
.env.local
.env.production`} />
                </StepCard>

                <StepCard number={5} title="Backup do banco de dados">
                  <p>Configure backups automáticos no Supabase (plano Pro) ou faça backups manuais:</p>
                  <CodeBlock id="backup" code={`# Usar pg_dump para backup manual
pg_dump -h db.SEU-PROJETO.supabase.co \\
  -U postgres \\
  -d postgres \\
  -f backup_$(date +%Y%m%d).sql`} />
                </StepCard>

                <StepCard number={6} title="Monitoramento">
                  <p>Ferramentas recomendadas para monitorar a aplicação:</p>
                  <ul className="list-disc ml-4 space-y-1">
                    <li><strong>Vercel Analytics</strong> — Métricas de performance (gratuito)</li>
                    <li><strong>Supabase Dashboard</strong> — Logs de API e queries</li>
                    <li><strong>UptimeRobot</strong> — Alertas se o site cair (gratuito)</li>
                    <li><strong>Sentry</strong> — Tracking de erros JavaScript (gratuito até 5K events)</li>
                  </ul>
                </StepCard>

                {/* Final Checklist */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white">
                  <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                    <CheckCircle2 size={22} className="text-green-400" />
                    Checklist Final para Produção
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      'Supabase configurado',
                      'Tabelas criadas (SQL executado)',
                      'Senhas padrão alteradas',
                      'RLS configurado',
                      '.env no .gitignore',
                      'Código no GitHub',
                      'Deploy no Vercel/Netlify',
                      'Domínio configurado',
                      'SSL ativo (HTTPS)',
                      'Backup configurado',
                      'Monitoramento ativo',
                      'Testes com dados reais',
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                        <Circle size={14} className="text-slate-500 shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
