import { 
  Package, Truck, TrendingUp, Clock, CheckCircle2, 
  MapPin, Star, ArrowUpRight, ArrowDownRight, Activity, Loader2, Plus
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { User } from '../types';
import { useDeliveries, useDrivers, useClients } from '../hooks/useSupabase';
import { weeklyPerformance, dailyRequests } from '../data/mockData';

interface DashboardProps {
  user: User;
}

export function Dashboard({ user }: DashboardProps) {
  const { deliveries, loading: loadingDeliveries } = useDeliveries();
  const { drivers, loading: loadingDrivers } = useDrivers();
  const { clients, loading: loadingClients } = useClients();

  const isLoading = loadingDeliveries || loadingDrivers || loadingClients;

  const activeDeliveries = deliveries.filter(d => d.status === 'in_transit' || d.status === 'pending');
  const totalDrivers = drivers.length;
  const availableDrivers = drivers.filter(d => d.status === 'available').length;
  const totalMonthDeliveries = deliveries.length;

  const topDrivers = [...drivers].sort((a, b) => b.deliveries - a.deliveries).slice(0, 5);
  const topClients = [...clients].sort((a, b) => b.totalOrders - a.totalOrders).slice(0, 5);

  const totalRevenue = deliveries.reduce((sum, d) => sum + d.value, 0);

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    in_transit: 'bg-blue-100 text-blue-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  const statusLabels: Record<string, string> = {
    pending: 'Pendente',
    in_transit: 'Em Trânsito',
    delivered: 'Entregue',
    cancelled: 'Cancelada',
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-slate-500 text-lg">Carregando dados...</p>
          <p className="text-slate-400 text-sm mt-1">Conectando ao banco de dados</p>
        </div>
      </div>
    );
  }

  const EmptyState = ({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle: string }) => (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-3">
        <Icon size={24} className="text-slate-400" />
      </div>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
          Olá, {user.name.split(' ')[0]}! 👋
        </h1>
        <p className="text-slate-500 mt-1">Aqui está o resumo das suas operações hoje.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Package size={24} className="text-orange-600" />
            </div>
            {activeDeliveries.length > 0 && (
              <span className="flex items-center gap-1 text-green-600 text-sm font-medium bg-green-50 px-2 py-1 rounded-lg">
                <ArrowUpRight size={14} /> Ativas
              </span>
            )}
          </div>
          <p className="text-3xl font-bold text-slate-900">{activeDeliveries.length}</p>
          <p className="text-sm text-slate-500 mt-1">Entregas Ativas</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Truck size={24} className="text-blue-600" />
            </div>
            <span className="text-sm text-slate-500 font-medium">{availableDrivers} disponíveis</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{totalDrivers}</p>
          <p className="text-sm text-slate-500 mt-1">Motoristas Cadastrados</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <CheckCircle2 size={24} className="text-emerald-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{totalMonthDeliveries}</p>
          <p className="text-sm text-slate-500 mt-1">Entregas no Mês</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <TrendingUp size={24} className="text-purple-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">
            {totalRevenue > 0 ? `R$ ${(totalRevenue / 1000).toFixed(1)}K` : 'R$ 0'}
          </p>
          <p className="text-sm text-slate-500 mt-1">Faturamento Mensal</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Performance */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-slate-900">Desempenho Semanal</h3>
              <p className="text-sm text-slate-500">Quantidade de entregas por dia</p>
            </div>
            <div className="flex items-center gap-1 text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg text-sm font-medium">
              <Activity size={16} />
              {weeklyPerformance.reduce((s, w) => s + w.entregas, 0)} total
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={weeklyPerformance} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                formatter={(value: unknown) => [`${value} entregas`, 'Entregas']}
              />
              <Bar dataKey="entregas" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#ea580c" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Daily Requests */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-slate-900">Histórico de Solicitações</h3>
              <p className="text-sm text-slate-500">Solicitações nos últimos 7 dias</p>
            </div>
            <div className="flex items-center gap-1 text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg text-sm font-medium">
              <Clock size={16} />
              Últimos 7 dias
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={dailyRequests}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                formatter={(value: unknown) => [`${value} solicitações`, 'Solicitações']}
              />
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="solicitacoes" stroke="#3b82f6" strokeWidth={2.5} fill="url(#areaGradient)" dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Middle Row - Top Drivers & Clients & Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Drivers */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-slate-900">🏆 Top Motoristas</h3>
            <span className="text-xs text-slate-400">Por entregas</span>
          </div>
          {topDrivers.length > 0 ? (
            <div className="space-y-3">
              {topDrivers.map((driver, idx) => (
                <div key={driver.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                    idx === 0 ? 'bg-amber-100 text-amber-700' :
                    idx === 1 ? 'bg-slate-200 text-slate-600' :
                    idx === 2 ? 'bg-orange-100 text-orange-700' :
                    'bg-slate-100 text-slate-500'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{driver.name}</p>
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <Star size={12} className="text-yellow-400 fill-yellow-400" /> {driver.rating}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">{driver.deliveries}</p>
                    <p className="text-xs text-slate-400">entregas</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={Truck} title="Nenhum motorista" subtitle="Cadastre motoristas na aba Motoristas" />
          )}
        </div>

        {/* Top Clients */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-slate-900">⭐ Top Clientes</h3>
            <span className="text-xs text-slate-400">Por pedidos</span>
          </div>
          {topClients.length > 0 ? (
            <div className="space-y-3">
              {topClients.map((client, idx) => (
                <div key={client.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                    idx === 0 ? 'bg-amber-100 text-amber-700' :
                    idx === 1 ? 'bg-slate-200 text-slate-600' :
                    idx === 2 ? 'bg-orange-100 text-orange-700' :
                    'bg-slate-100 text-slate-500'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{client.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      client.contractType === 'fixo' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {client.contractType === 'fixo' ? 'Contrato' : 'Avulso'}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">{client.totalOrders}</p>
                    <p className="text-xs text-slate-400">pedidos</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={Plus} title="Nenhum cliente" subtitle="Cadastre clientes na aba Clientes" />
          )}
        </div>

        {/* Map placeholder / Active Deliveries Map */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-slate-900">🗺️ Entregas Ativas</h3>
            <span className="text-xs text-orange-500 font-medium">{activeDeliveries.length} em andamento</span>
          </div>
          <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl h-44 flex items-center justify-center mb-4 overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <svg viewBox="0 0 400 300" className="w-full h-full">
                <path d="M50,150 Q100,50 200,100 T350,150" stroke="#3b82f6" fill="none" strokeWidth="2" strokeDasharray="5,5" />
                <path d="M80,200 Q150,120 250,180 T380,130" stroke="#f97316" fill="none" strokeWidth="2" strokeDasharray="5,5" />
                <path d="M30,100 Q120,180 220,80 T370,200" stroke="#10b981" fill="none" strokeWidth="2" strokeDasharray="5,5" />
              </svg>
            </div>
            {activeDeliveries.length > 0 ? (
              activeDeliveries.slice(0, 4).map((del, i) => (
                <div key={del.id} className="absolute" style={{ 
                  top: `${20 + (i * 25)}%`, 
                  left: `${15 + (i * 20)}%` 
                }}>
                  <div className="relative">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                      <MapPin size={16} className="text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center z-10">
                <MapPin size={32} className="text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-400">Sem entregas ativas</p>
              </div>
            )}
          </div>
          <div className="space-y-2">
            {activeDeliveries.length > 0 ? (
              activeDeliveries.slice(0, 3).map((del) => (
                <div key={del.id} className="flex items-center gap-2 text-xs">
                  <span className={`w-2 h-2 rounded-full ${del.status === 'in_transit' ? 'bg-blue-500' : 'bg-yellow-500'}`} />
                  <span className="text-slate-600 truncate flex-1">{del.driverName}</span>
                  <span className="text-slate-400">{del.destination.substring(0, 20)}...</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center">Nenhuma entrega em andamento</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Deliveries Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">📦 Entregas Recentes</h3>
          <p className="text-sm text-slate-500 mt-1">Últimas entregas registradas no sistema</p>
        </div>
        {deliveries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">ID</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Cliente</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Motorista</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Destino</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Status</th>
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {deliveries.slice(0, 6).map((del) => (
                  <tr key={del.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-slate-500">#{del.id.substring(0, 8).toUpperCase()}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{del.clientName}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{del.driverName}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{del.destination}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[del.status]}`}>
                        {statusLabels[del.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900 text-right">
                      R$ {del.value.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Package size={48} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">Nenhuma entrega registrada</p>
            <p className="text-sm text-slate-400 mt-1">Vá para a aba Entregas para registrar a primeira entrega</p>
          </div>
        )}
      </div>
    </div>
  );
}
