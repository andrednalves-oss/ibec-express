import { useState } from 'react';
import { 
  DollarSign, TrendingUp, TrendingDown, Wallet, Receipt, 
  Users, ArrowUpRight, ArrowDownRight, Plus, X, PieChart as PieChartIcon, Loader2, RefreshCw
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import { monthlyRevVsExp } from '../data/mockData';
import { useFinancials, usePayroll } from '../hooks/useSupabase';

export function FinancialPage() {
  const { financials, loading: loadingFinancials, addFinancial, fetchFinancials } = useFinancials();
  const { payroll, loading: loadingPayroll } = usePayroll();
  const [activeTab, setActiveTab] = useState<'overview' | 'payroll'>('overview');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    type: 'revenue' as 'revenue' | 'expense',
    category: '',
    description: '',
    value: '',
    date: new Date().toISOString().split('T')[0],
  });

  const isLoading = loadingFinancials || loadingPayroll;

  const totalRevenue = financials.filter(f => f.type === 'revenue').reduce((acc, f) => acc + f.value, 0);
  const totalExpenses = financials.filter(f => f.type === 'expense').reduce((acc, f) => acc + f.value, 0);
  const profit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? ((profit / totalRevenue) * 100).toFixed(1) : '0';

  const avulsasRevenue = financials.filter(f => f.type === 'revenue' && f.category === 'Entregas Avulsas').reduce((acc, f) => acc + f.value, 0);
  const contratosRevenue = financials.filter(f => f.type === 'revenue' && f.category === 'Contratos Fixos').reduce((acc, f) => acc + f.value, 0);

  const expensesByCategory = financials
    .filter(f => f.type === 'expense')
    .reduce((acc, f) => {
      acc[f.category] = (acc[f.category] || 0) + f.value;
      return acc;
    }, {} as Record<string, number>);

  const expensePieData = Object.entries(expensesByCategory).map(([name, value]) => ({ name, value }));
  const COLORS = ['#f97316', '#3b82f6', '#8b5cf6', '#10b981', '#ef4444', '#f59e0b'];

  const revenuePieData = [
    { name: 'Entregas Avulsas', value: avulsasRevenue },
    { name: 'Contratos Fixos', value: contratosRevenue },
  ];

  const cashFlowData = monthlyRevVsExp.map(m => ({
    ...m,
    saldo: m.receitas - m.despesas,
  }));

  const totalPayroll = payroll.reduce((acc, p) => acc + p.total, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await addFinancial({
        type: form.type,
        category: form.category,
        description: form.description,
        value: parseFloat(form.value) || 0,
        date: form.date,
      });
      setShowModal(false);
      setForm({ type: 'revenue', category: '', description: '', value: '', date: new Date().toISOString().split('T')[0] });
    } catch (err) {
      console.error('Erro ao salvar lançamento:', err);
    }
    setSaving(false);
  };

  const revenueCategories = ['Entregas Avulsas', 'Contratos Fixos', 'Outros'];
  const expenseCategories = ['Combustível', 'Manutenção', 'Folha de Pagamento', 'Seguro', 'Aluguel', 'Telefonia', 'Outros'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-slate-500">Carregando dados financeiros...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">💰 Financeiro</h1>
          <p className="text-slate-500 mt-1">Visão completa do faturamento e despesas</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => fetchFinancials()} className="p-3 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-all" title="Atualizar">
            <RefreshCw size={20} />
          </button>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/30 active:scale-[0.98]">
            <Plus size={20} />
            Novo Lançamento
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-white p-1 rounded-xl border border-slate-200 w-fit">
        <button onClick={() => setActiveTab('overview')} className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'overview' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'text-slate-600 hover:bg-slate-50'}`}>
          Visão Geral
        </button>
        <button onClick={() => setActiveTab('payroll')} className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'payroll' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'text-slate-600 hover:bg-slate-50'}`}>
          Folha de Pagamento
        </button>
      </div>

      {activeTab === 'overview' ? (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <TrendingUp size={24} className="text-green-600" />
                </div>
                <span className="flex items-center gap-1 text-green-600 text-sm font-medium bg-green-50 px-2 py-1 rounded-lg">
                  <ArrowUpRight size={14} /> 15%
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-900">R$ {(totalRevenue / 1000).toFixed(1)}K</p>
              <p className="text-sm text-slate-500 mt-1">Receita Total</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <TrendingDown size={24} className="text-red-600" />
                </div>
                <span className="flex items-center gap-1 text-red-500 text-sm font-medium bg-red-50 px-2 py-1 rounded-lg">
                  <ArrowDownRight size={14} /> 5%
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-900">R$ {(totalExpenses / 1000).toFixed(1)}K</p>
              <p className="text-sm text-slate-500 mt-1">Despesas Totais</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Wallet size={24} className="text-emerald-600" />
                </div>
              </div>
              <p className={`text-2xl font-bold ${profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>R$ {(profit / 1000).toFixed(1)}K</p>
              <p className="text-sm text-slate-500 mt-1">Lucro Líquido</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <PieChartIcon size={24} className="text-orange-600" />
                </div>
              </div>
              <p className={`text-2xl font-bold ${Number(profitMargin) >= 0 ? 'text-orange-600' : 'text-red-600'}`}>{profitMargin}%</p>
              <p className="text-sm text-slate-500 mt-1">Margem de Lucro</p>
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-2 mb-4">
                <Receipt size={20} />
                <h3 className="font-semibold">Entregas Avulsas</h3>
              </div>
              <p className="text-3xl font-bold">R$ {avulsasRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <p className="text-green-100 mt-1 text-sm">{financials.filter(f => f.category === 'Entregas Avulsas').length} lançamentos</p>
              <div className="mt-4 bg-white/20 rounded-lg h-2">
                <div className="bg-white rounded-lg h-2" style={{ width: `${totalRevenue > 0 ? (avulsasRevenue / totalRevenue) * 100 : 0}%` }} />
              </div>
              <p className="text-xs text-green-100 mt-1">{totalRevenue > 0 ? ((avulsasRevenue / totalRevenue) * 100).toFixed(0) : 0}% da receita total</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign size={20} />
                <h3 className="font-semibold">Contratos Fixos</h3>
              </div>
              <p className="text-3xl font-bold">R$ {contratosRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <p className="text-blue-100 mt-1 text-sm">{financials.filter(f => f.category === 'Contratos Fixos').length} contratos ativos</p>
              <div className="mt-4 bg-white/20 rounded-lg h-2">
                <div className="bg-white rounded-lg h-2" style={{ width: `${totalRevenue > 0 ? (contratosRevenue / totalRevenue) * 100 : 0}%` }} />
              </div>
              <p className="text-xs text-blue-100 mt-1">{totalRevenue > 0 ? ((contratosRevenue / totalRevenue) * 100).toFixed(0) : 0}% da receita total</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-semibold text-slate-900">📊 Receitas vs Despesas</h3>
                  <p className="text-sm text-slate-500">Comparativo mensal</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={monthlyRevVsExp} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    formatter={(value: unknown) => [`R$ ${Number(value).toLocaleString('pt-BR')}`, '']}
                  />
                  <Bar dataKey="receitas" name="Receitas" fill="#10b981" radius={[6, 6, 0, 0]} barSize={20} />
                  <Bar dataKey="despesas" name="Despesas" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={20} />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-semibold text-slate-900">🧩 Despesas por Categoria</h3>
                  <p className="text-sm text-slate-500">Distribuição dos gastos</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={expensePieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}>
                    {expensePieData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: unknown) => [`R$ ${Number(value).toLocaleString('pt-BR')}`, '']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Cash Flow */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-slate-900">💹 Fluxo de Caixa</h3>
                <p className="text-sm text-slate-500">Saldo acumulado mensal</p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                  <span className="text-slate-500">Receitas</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <span className="text-slate-500">Despesas</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  <span className="text-slate-500">Saldo</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={cashFlowData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(value: unknown) => [`R$ ${Number(value).toLocaleString('pt-BR')}`, '']}
                />
                <defs>
                  <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="receitas" name="Receitas" stroke="#10b981" strokeWidth={2} fill="url(#colorReceitas)" />
                <Area type="monotone" dataKey="despesas" name="Despesas" stroke="#ef4444" strokeWidth={2} fill="url(#colorDespesas)" />
                <Area type="monotone" dataKey="saldo" name="Saldo" stroke="#3b82f6" strokeWidth={2.5} fill="url(#colorSaldo)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue Distribution & Recent */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-4">📈 Distribuição de Receitas</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={revenuePieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}>
                    <Cell fill="#10b981" />
                    <Cell fill="#3b82f6" />
                  </Pie>
                  <Tooltip formatter={(value: unknown) => [`R$ ${Number(value).toLocaleString('pt-BR')}`, '']} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-4">📋 Últimos Lançamentos</h3>
              <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2">
                {financials.slice(0, 8).map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${entry.type === 'revenue' ? 'bg-green-100' : 'bg-red-100'}`}>
                        {entry.type === 'revenue' ? <ArrowUpRight size={18} className="text-green-600" /> : <ArrowDownRight size={18} className="text-red-600" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{entry.description}</p>
                        <p className="text-xs text-slate-400">{entry.category} · {entry.date}</p>
                      </div>
                    </div>
                    <span className={`text-sm font-bold ${entry.type === 'revenue' ? 'text-green-600' : 'text-red-600'}`}>
                      {entry.type === 'revenue' ? '+' : '-'} R$ {entry.value.toLocaleString('pt-BR')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Payroll Tab */
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Users size={20} />
                <span className="text-orange-100 text-sm">Total da Folha</span>
              </div>
              <p className="text-3xl font-bold">R$ {totalPayroll.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <p className="text-orange-100 text-sm mt-1">Dezembro 2024</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-slate-200">
              <p className="text-sm text-slate-500 mb-2">Colaboradores</p>
              <p className="text-3xl font-bold text-slate-900">{payroll.length}</p>
              <p className="text-xs text-slate-400 mt-1">na folha atual</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-slate-200">
              <p className="text-sm text-slate-500 mb-2">Média Salarial</p>
              <p className="text-3xl font-bold text-slate-900">R$ {payroll.length > 0 ? (totalPayroll / payroll.length).toFixed(0) : '0'}</p>
              <p className="text-xs text-slate-400 mt-1">por colaborador</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900">📋 Folha de Pagamento - Dezembro 2024</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Colaborador</th>
                    <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Salário Base</th>
                    <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Bônus</th>
                    <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Descontos</th>
                    <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payroll.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 font-bold text-sm">
                            {entry.driverName.charAt(0)}
                          </div>
                          <span className="text-sm font-medium text-slate-900">{entry.driverName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700 text-right">R$ {entry.baseSalary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      <td className="px-6 py-4 text-sm text-green-600 font-medium text-right">+ R$ {entry.bonus.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      <td className="px-6 py-4 text-sm text-red-600 font-medium text-right">- R$ {entry.deductions.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-900 text-right">R$ {entry.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 font-bold">
                    <td className="px-6 py-4 text-sm text-slate-900">TOTAL</td>
                    <td className="px-6 py-4 text-sm text-slate-900 text-right">R$ {payroll.reduce((a, p) => a + p.baseSalary, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="px-6 py-4 text-sm text-green-600 text-right">+ R$ {payroll.reduce((a, p) => a + p.bonus, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="px-6 py-4 text-sm text-red-600 text-right">- R$ {payroll.reduce((a, p) => a + p.deductions, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="px-6 py-4 text-sm text-slate-900 text-right">R$ {totalPayroll.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      )}

      {/* New Entry Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Novo Lançamento</h2>
                <p className="text-sm text-slate-500">Registre uma receita ou despesa</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Tipo</label>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setForm({ ...form, type: 'revenue', category: '' })} className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${form.type === 'revenue' ? 'border-green-500 bg-green-50 text-green-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                    <ArrowUpRight size={18} className="mx-auto mb-1" />
                    Receita
                  </button>
                  <button type="button" onClick={() => setForm({ ...form, type: 'expense', category: '' })} className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${form.type === 'expense' ? 'border-red-500 bg-red-50 text-red-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                    <ArrowDownRight size={18} className="mx-auto mb-1" />
                    Despesa
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Categoria</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500">
                  <option value="">Selecione a categoria</option>
                  {(form.type === 'revenue' ? revenueCategories : expenseCategories).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Descrição</label>
                <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required placeholder="Descrição do lançamento" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Valor (R$)</label>
                  <input type="number" step="0.01" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} required placeholder="0.00" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Data</label>
                  <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">Cancelar</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl text-sm font-semibold hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/30 disabled:opacity-60 flex items-center justify-center gap-2">
                  {saving ? <><Loader2 size={16} className="animate-spin" /> Salvando...</> : 'Registrar Lançamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
