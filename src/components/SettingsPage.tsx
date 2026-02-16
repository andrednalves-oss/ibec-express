import { useState } from 'react';
import {
  Settings, Database, Globe, Shield, Bell, Palette, 
  Save, Check, Server, Wifi, WifiOff, ExternalLink,
  Key, Mail, Phone, Building2, Copy, FileCode,
  HelpCircle, BookOpen, Headphones, MessageSquare
} from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'database' | 'notifications' | 'help'>('general');
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const dbConnected = isSupabaseConfigured();

  const [company, setCompany] = useState({
    name: 'IBEC EXPRESS',
    cnpj: '00.000.000/0001-00',
    email: 'contato@ibecexpress.com.br',
    phone: '(11) 4002-8922',
    address: 'São Paulo - SP',
  });

  const [pricing, setPricing] = useState({
    baseFee: '8.00',
    carPerKm: '3.50',
    motoPerKm: '2.50',
    minCar: '18.00',
    minMoto: '12.00',
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const tabs = [
    { id: 'general' as const, label: 'Geral', icon: <Settings size={18} /> },
    { id: 'database' as const, label: 'Banco de Dados', icon: <Database size={18} /> },
    { id: 'notifications' as const, label: 'Notificações', icon: <Bell size={18} /> },
    { id: 'help' as const, label: 'Ajuda', icon: <HelpCircle size={18} /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">⚙️ Configurações</h1>
        <p className="text-slate-500 mt-1">Gerencie as configurações do sistema</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-white p-1 rounded-xl border border-slate-200 w-fit overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'general' && (
        <div className="space-y-6">
          {/* Company Info */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <Building2 size={18} className="text-orange-500" />
                Dados da Empresa
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Nome da Empresa</label>
                  <input
                    type="text"
                    value={company.name}
                    onChange={e => setCompany({ ...company, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">CNPJ</label>
                  <input
                    type="text"
                    value={company.cnpj}
                    onChange={e => setCompany({ ...company, cnpj: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block flex items-center gap-1">
                    <Mail size={14} className="text-slate-400" /> E-mail
                  </label>
                  <input
                    type="email"
                    value={company.email}
                    onChange={e => setCompany({ ...company, email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block flex items-center gap-1">
                    <Phone size={14} className="text-slate-400" /> Telefone
                  </label>
                  <input
                    type="text"
                    value={company.phone}
                    onChange={e => setCompany({ ...company, phone: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Endereço</label>
                <input
                  type="text"
                  value={company.address}
                  onChange={e => setCompany({ ...company, address: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Pricing Config */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <Palette size={18} className="text-blue-500" />
                Tabela de Preços (Cálculo de Distância)
              </h3>
              <p className="text-sm text-slate-500 mt-1">Estes valores são usados no cálculo automático de valor ao criar entregas</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Taxa Base (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={pricing.baseFee}
                    onChange={e => setPricing({ ...pricing, baseFee: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Carro R$/km</label>
                  <input
                    type="number"
                    step="0.01"
                    value={pricing.carPerKm}
                    onChange={e => setPricing({ ...pricing, carPerKm: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Moto R$/km</label>
                  <input
                    type="number"
                    step="0.01"
                    value={pricing.motoPerKm}
                    onChange={e => setPricing({ ...pricing, motoPerKm: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Mín. Carro (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={pricing.minCar}
                    onChange={e => setPricing({ ...pricing, minCar: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Mín. Moto (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={pricing.minMoto}
                    onChange={e => setPricing({ ...pricing, minMoto: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Save */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all shadow-lg ${
                saved
                  ? 'bg-green-500 text-white shadow-green-500/30'
                  : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-orange-500/30 hover:from-orange-600 hover:to-orange-700'
              }`}
            >
              {saved ? <><Check size={18} /> Salvo!</> : <><Save size={18} /> Salvar Configurações</>}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'database' && (
        <div className="space-y-6">
          {/* Status Card */}
          <div className={`rounded-2xl p-6 border ${
            dbConnected ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                dbConnected ? 'bg-green-500' : 'bg-yellow-500'
              }`}>
                {dbConnected ? <Wifi size={28} className="text-white" /> : <WifiOff size={28} className="text-white" />}
              </div>
              <div>
                <h3 className={`text-xl font-bold ${dbConnected ? 'text-green-900' : 'text-yellow-900'}`}>
                  {dbConnected ? 'Supabase Conectado ✅' : 'Modo Offline ⚠️'}
                </h3>
                <p className={`text-sm mt-0.5 ${dbConnected ? 'text-green-700' : 'text-yellow-700'}`}>
                  {dbConnected 
                    ? 'Banco de dados funcionando. Dados sendo persistidos.'
                    : 'Usando dados em memória. Configure o Supabase para persistir.'}
                </p>
              </div>
            </div>
          </div>

          {!dbConnected && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <Key size={18} className="text-orange-500" />
                Configurar Supabase
              </h3>
              <p className="text-sm text-slate-600">
                Crie um arquivo <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono">.env</code> na raiz do projeto com:
              </p>
              <div className="bg-slate-900 rounded-xl p-4 relative group">
                <button
                  onClick={() => handleCopy('VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co\nVITE_SUPABASE_ANON_KEY=sua-chave-anonima-aqui', 'env')}
                  className="absolute top-3 right-3 p-1.5 text-slate-500 hover:text-white rounded-lg hover:bg-white/10"
                >
                  {copied === 'env' ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                </button>
                <pre className="text-sm font-mono text-green-400">
{`VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-aqui`}
                </pre>
              </div>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 transition-all"
              >
                <ExternalLink size={14} />
                Abrir Supabase Dashboard
              </a>
            </div>
          )}

          {/* Tables Info */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <Server size={18} className="text-purple-500" />
                Tabelas do Sistema
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase px-6 py-3">Tabela</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase px-6 py-3">Descrição</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase px-6 py-3">Campos Principais</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { name: 'users', desc: 'Usuários do sistema', fields: 'name, email, role, password_hash', color: 'bg-blue-500' },
                    { name: 'drivers', desc: 'Motoristas e motoboys', fields: 'name, phone, vehicle, plate, type, status', color: 'bg-orange-500' },
                    { name: 'clients', desc: 'Clientes cadastrados', fields: 'name, email, cnpj, contract_type', color: 'bg-green-500' },
                    { name: 'deliveries', desc: 'Entregas registradas', fields: 'origin, destination, status, value, type', color: 'bg-purple-500' },
                    { name: 'financial_entries', desc: 'Lançamentos financeiros', fields: 'type, category, value, entry_date', color: 'bg-emerald-500' },
                    { name: 'payroll', desc: 'Folha de pagamento', fields: 'driver_name, base_salary, bonus, total', color: 'bg-red-500' },
                  ].map(table => (
                    <tr key={table.name} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${table.color}`} />
                          <code className="text-sm font-mono font-medium text-slate-900">{table.name}</code>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{table.desc}</td>
                      <td className="px-6 py-4 text-xs text-slate-400 font-mono">{table.fields}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SQL File */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-3">
              <FileCode size={18} className="text-blue-500" />
              <h3 className="font-semibold text-slate-900">Script SQL</h3>
            </div>
            <p className="text-sm text-slate-600 mb-3">
              O arquivo <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono">SUPABASE_SETUP.sql</code> na raiz do projeto contém todo o SQL necessário para criar as tabelas, índices, políticas de segurança e dados iniciais.
            </p>
            <p className="text-sm text-slate-500">
              Execute-o no <strong>SQL Editor</strong> do Supabase ao configurar o banco pela primeira vez.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-4">
              <Bell size={18} className="text-orange-500" />
              Preferências de Notificação
            </h3>
            <div className="space-y-4">
              {[
                { label: 'Nova entrega registrada', desc: 'Receber alerta quando uma nova entrega é criada', enabled: true },
                { label: 'Entrega concluída', desc: 'Notificar quando uma entrega é finalizada', enabled: true },
                { label: 'Novo cliente cadastrado', desc: 'Alerta de cadastro de novo cliente', enabled: false },
                { label: 'Relatório diário', desc: 'Resumo das operações do dia por e-mail', enabled: false },
                { label: 'Alertas financeiros', desc: 'Notificar sobre despesas acima do limite', enabled: true },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{item.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={item.enabled} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500" />
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all shadow-lg ${
                saved
                  ? 'bg-green-500 text-white shadow-green-500/30'
                  : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-orange-500/30 hover:from-orange-600 hover:to-orange-700'
              }`}
            >
              {saved ? <><Check size={18} /> Salvo!</> : <><Save size={18} /> Salvar</>}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'help' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-2">Precisa de ajuda?</h3>
            <p className="text-orange-100">Estamos aqui para ajudar você a tirar o máximo do sistema IBEC EXPRESS.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-all">
              <BookOpen size={24} className="text-blue-500 mb-3" />
              <h4 className="font-semibold text-slate-900 mb-2">Documentação</h4>
              <p className="text-sm text-slate-500">Guia completo de todas as funcionalidades do sistema.</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-all">
              <MessageSquare size={24} className="text-green-500 mb-3" />
              <h4 className="font-semibold text-slate-900 mb-2">Suporte WhatsApp</h4>
              <p className="text-sm text-slate-500">Tire dúvidas diretamente pelo WhatsApp.</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-all">
              <Headphones size={24} className="text-purple-500 mb-3" />
              <h4 className="font-semibold text-slate-900 mb-2">Suporte Técnico</h4>
              <p className="text-sm text-slate-500">Suporte técnico para configuração e deploy.</p>
            </div>
          </div>

          {/* Tech Stack */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">🛠️ Tecnologias Utilizadas</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { name: 'React 19', desc: 'Frontend' },
                { name: 'TypeScript', desc: 'Tipagem' },
                { name: 'Tailwind CSS 4', desc: 'Estilização' },
                { name: 'Vite', desc: 'Build Tool' },
                { name: 'Supabase', desc: 'Backend/DB' },
                { name: 'Recharts', desc: 'Gráficos' },
                { name: 'Lucide Icons', desc: 'Ícones' },
                { name: 'OpenStreetMap', desc: 'Mapas/Rotas' },
              ].map(tech => (
                <div key={tech.name} className="bg-slate-50 rounded-xl p-3 text-center">
                  <p className="text-sm font-medium text-slate-900">{tech.name}</p>
                  <p className="text-xs text-slate-400">{tech.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-6 text-center">
            <p className="text-sm text-slate-500">
              IBEC EXPRESS v1.0.0 • Sistema de Gestão de Transportes
            </p>
            <p className="text-xs text-slate-400 mt-1">
              © 2024 IBEC EXPRESS - Todos os direitos reservados
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
