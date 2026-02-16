import { useState, useEffect } from 'react';
import {
  Plus, Search, Filter, Package, MapPin, Truck, X, Eye, ChevronDown,
  Loader2, RefreshCw, Navigation, Clock, DollarSign, Route, Zap,
  Trash2, ChevronUp, Flag, Play, Phone, User, Box, FileText
} from 'lucide-react';
import { Delivery } from '../types';
import { useDeliveries, useDrivers, useClients } from '../hooks/useSupabase';
import { useDistance } from '../hooks/useDistance';
import { AddressInput } from './AddressInput';

// ===== ROUTE STOP TYPE =====
interface RouteStop {
  id: string;
  address: string;
  recipientName: string;
  recipientPhone: string;
  description: string;
  order: number;
}

const createEmptyStop = (order: number): RouteStop => ({
  id: `stop-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  address: '',
  recipientName: '',
  recipientPhone: '',
  description: '',
  order,
});

export function DeliveriesPage() {
  const { deliveries, loading, addDelivery, updateDeliveryStatus, fetchDeliveries } = useDeliveries();
  const { drivers } = useDrivers();
  const { clients } = useClients();
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState<Delivery | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);
  const [formStep, setFormStep] = useState(1);

  const {
    loading: distLoading,
    distance,
    error: distError,
    originSuggestions,
    destSuggestions,
    loadingSuggestions,
    calculateDistance,
    clearDistance,
    searchOriginAddresses,
    searchDestAddresses,
    clearSuggestions,
    calculateSuggestedPrice,
  } = useDistance();

  // ===== FORM STATE WITH MULTI-STOPS =====
  const [form, setForm] = useState({
    clientId: '',
    driverId: '',
    origin: '',
    stops: [createEmptyStop(1)] as RouteStop[],
    value: '',
    type: 'avulsa' as 'avulsa' | 'contrato',
    description: '',
    priority: 'Normal',
  });

  // Track which stop is being edited for address autocomplete
  const [activeStopIndex, setActiveStopIndex] = useState<number | null>(null);

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    in_transit: 'bg-blue-100 text-blue-700 border-blue-200',
    delivered: 'bg-green-100 text-green-700 border-green-200',
    cancelled: 'bg-red-100 text-red-700 border-red-200',
  };

  const statusLabels: Record<string, string> = {
    pending: 'Pendente',
    in_transit: 'Em Trânsito',
    delivered: 'Entregue',
    cancelled: 'Cancelada',
  };

  const priorityColors: Record<string, string> = {
    Normal: 'bg-gray-100 text-gray-600',
    Alta: 'bg-orange-100 text-orange-700',
    Urgente: 'bg-red-100 text-red-700',
  };

  const filteredDeliveries = deliveries.filter((d) => {
    const matchesStatus = filterStatus === 'all' || d.status === filterStatus;
    const matchesSearch = d.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.destination.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // ===== STOP MANAGEMENT =====
  const addStop = () => {
    setForm(prev => ({
      ...prev,
      stops: [...prev.stops, createEmptyStop(prev.stops.length + 1)],
    }));
  };

  const removeStop = (stopId: string) => {
    if (form.stops.length <= 1) return;
    setForm(prev => ({
      ...prev,
      stops: prev.stops
        .filter(s => s.id !== stopId)
        .map((s, idx) => ({ ...s, order: idx + 1 })),
    }));
  };

  const updateStop = (stopId: string, field: keyof RouteStop, value: string) => {
    setForm(prev => ({
      ...prev,
      stops: prev.stops.map(s => s.id === stopId ? { ...s, [field]: value } : s),
    }));
  };

  const moveStop = (index: number, direction: 'up' | 'down') => {
    const newStops = [...form.stops];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newStops.length) return;
    [newStops[index], newStops[targetIndex]] = [newStops[targetIndex], newStops[index]];
    setForm(prev => ({
      ...prev,
      stops: newStops.map((s, idx) => ({ ...s, order: idx + 1 })),
    }));
  };

  // ===== DISTANCE CALCULATION =====
  const handleCalculateDistance = async () => {
    if (!form.origin) return;
    const validStops = form.stops.filter(s => s.address.trim());
    if (validStops.length === 0) return;

    // For multi-stop, calculate total distance by chaining
    // Origin -> Stop1 -> Stop2 -> ...
    const addresses = [form.origin, ...validStops.map(s => s.address)];
    
    let totalDist = 0;
    let totalDur = 0;
    let lastAddr = addresses[0];
    let success = true;

    for (let i = 1; i < addresses.length; i++) {
      const result = await calculateDistance(lastAddr, addresses[i]);
      if (result) {
        totalDist += result.distanceKm;
        totalDur += result.durationMin;
        lastAddr = addresses[i];
      } else {
        success = false;
        break;
      }
    }

    if (success && totalDist > 0) {
      // Calculate suggested price for total route
      const selectedDriver = drivers.find(d => d.id === form.driverId);
      const vehicleType = selectedDriver?.type || 'motorista';
      const stopFee = Math.max(0, (validStops.length - 1)) * 5.0; // R$5 per extra stop
      const basePrice = calculateSuggestedPrice(totalDist, vehicleType);
      const totalPrice = basePrice + stopFee;

      if (!form.value) {
        setForm(prev => ({ ...prev, value: totalPrice.toFixed(2) }));
      }
    }
  };

  const handleApplySuggestedPrice = () => {
    if (!distance) return;
    const selectedDriver = drivers.find(d => d.id === form.driverId);
    const vehicleType = selectedDriver?.type || 'motorista';
    const validStops = form.stops.filter(s => s.address.trim());
    const stopFee = Math.max(0, (validStops.length - 1)) * 5.0;
    const suggestedPrice = calculateSuggestedPrice(distance.distanceKm, vehicleType) + stopFee;
    setForm(prev => ({ ...prev, value: suggestedPrice.toFixed(2) }));
  };

  // ===== SUBMIT =====
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find(c => c.id === form.clientId);
    const driver = drivers.find(d => d.id === form.driverId);
    if (!client || !driver) return;

    setSaving(true);
    try {
      const validStops = form.stops.filter(s => s.address.trim());
      const stopsSummary = validStops.map((s, i) =>
        `📍 Parada ${i + 1}: ${s.address}${s.recipientName ? ` (${s.recipientName})` : ''}${s.description ? ` - ${s.description}` : ''}`
      ).join(' | ');

      const destination = validStops.length === 1
        ? validStops[0].address
        : `${validStops.length} paradas: ${validStops.map(s => s.address.split(',')[0]).join(' → ')}`;

      const desc = [
        stopsSummary,
        distance ? `📏 Distância: ${distance.distanceKm}km | ⏱️ Tempo: ${distance.durationMin}min` : '',
        form.description,
      ].filter(Boolean).join(' | ');

      await addDelivery({
        clientName: client.name,
        clientId: form.clientId,
        driverId: form.driverId,
        driverName: driver.name,
        origin: form.origin,
        destination,
        value: parseFloat(form.value) || 0,
        type: form.type,
        description: desc,
      });
      handleCloseModal();
    } catch (err) {
      console.error('Erro ao salvar entrega:', err);
    }
    setSaving(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setForm({
      clientId: '', driverId: '', origin: '',
      stops: [createEmptyStop(1)],
      value: '', type: 'avulsa', description: '', priority: 'Normal',
    });
    setFormStep(1);
    clearDistance();
    clearSuggestions('all');
    setActiveStopIndex(null);
  };

  const handleStatusChange = async (id: string, newStatus: Delivery['status']) => {
    await updateDeliveryStatus(id, newStatus);
  };

  // Reset distance on address change
  useEffect(() => {
    clearDistance();
  }, [form.origin]);

  const stats = {
    total: deliveries.length,
    active: deliveries.filter(d => d.status === 'in_transit').length,
    pending: deliveries.filter(d => d.status === 'pending').length,
    delivered: deliveries.filter(d => d.status === 'delivered').length,
  };

  const canGoStep2 = form.clientId && form.origin && form.stops.some(s => s.address.trim());
  const canGoStep3 = form.driverId && form.value;
  const totalStops = form.stops.length;
  const validStops = form.stops.filter(s => s.address.trim());

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-slate-500">Carregando entregas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">📦 Entregas</h1>
          <p className="text-slate-500 mt-1">Gerencie todas as entregas do sistema</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => fetchDeliveries()} className="p-3 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-all" title="Atualizar">
            <RefreshCw size={20} />
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/30 active:scale-[0.98]"
          >
            <Plus size={20} />
            Nova Entrega
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
          <p className="text-sm text-slate-500">Total</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-blue-200 bg-blue-50/50">
          <p className="text-2xl font-bold text-blue-700">{stats.active}</p>
          <p className="text-sm text-blue-600">Em Trânsito</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-yellow-200 bg-yellow-50/50">
          <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
          <p className="text-sm text-yellow-600">Pendentes</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-green-200 bg-green-50/50">
          <p className="text-2xl font-bold text-green-700">{stats.delivered}</p>
          <p className="text-sm text-green-600">Entregues</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Buscar por cliente, motorista ou destino..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
        </div>
        <div className="relative">
          <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="pl-9 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 appearance-none cursor-pointer">
            <option value="all">Todos os Status</option>
            <option value="pending">Pendente</option>
            <option value="in_transit">Em Trânsito</option>
            <option value="delivered">Entregue</option>
            <option value="cancelled">Cancelada</option>
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">ID</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Cliente</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Roteiro</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Motorista</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Status</th>
                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Valor</th>
                <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDeliveries.map((del) => (
                <tr key={del.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono text-slate-500">#{del.id.substring(0, 8).toUpperCase()}</td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-slate-900">{del.clientName}</p>
                    <p className="text-xs text-slate-400">{del.date}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-2">
                      <Route size={14} className="text-orange-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                          {del.origin}
                        </p>
                        <p className="text-xs font-semibold text-orange-600 flex items-center gap-1 mt-0.5">
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                          {del.destination.length > 50 ? del.destination.substring(0, 50) + '...' : del.destination}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Truck size={14} className="text-orange-600" />
                      </div>
                      <span className="text-sm text-slate-700">{del.driverName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${statusColors[del.status]}`}>
                      {statusLabels[del.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-900 text-right">
                    R$ {del.value.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => setShowDetail(del)} className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all">
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredDeliveries.length === 0 && (
          <div className="text-center py-12">
            <Package size={48} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500">Nenhuma entrega encontrada</p>
          </div>
        )}
      </div>

      {/* ============ NEW DELIVERY MODAL - MULTI STOP ============ */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-3xl my-4 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Plus size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Nova Entrega</h2>
                  <p className="text-orange-100 text-sm">
                    {formStep === 1 && 'Roteiro com múltiplos endereços'}
                    {formStep === 2 && 'Motorista e valores'}
                    {formStep === 3 && 'Revisão e confirmação'}
                  </p>
                </div>
              </div>
              <button onClick={handleCloseModal} className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Steps */}
            <div className="px-6 py-3 bg-slate-50 border-b border-slate-100">
              <div className="flex items-center gap-2">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center gap-2 flex-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${formStep >= step ? 'bg-orange-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                      {formStep > step ? '✓' : step}
                    </div>
                    <span className={`text-xs font-medium hidden sm:block ${formStep >= step ? 'text-orange-600' : 'text-slate-400'}`}>
                      {step === 1 && 'Roteiro'}
                      {step === 2 && 'Motorista'}
                      {step === 3 && 'Confirmar'}
                    </span>
                    {step < 3 && <div className={`flex-1 h-0.5 rounded ${formStep > step ? 'bg-orange-500' : 'bg-slate-200'}`} />}
                  </div>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">

              {/* ===== STEP 1: ROTEIRO ===== */}
              {formStep === 1 && (
                <div className="space-y-6">
                  {/* Cliente */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                      <User size={16} className="text-orange-500" />
                      Cliente
                    </h3>
                    <select
                      value={form.clientId}
                      onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    >
                      <option value="">Selecione o cliente</option>
                      {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>

                  {/* Origem */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                      <Play size={16} className="text-green-500" />
                      Endereço de Coleta (Origem)
                    </h3>
                    <AddressInput
                      value={form.origin}
                      onChange={(val) => { setForm({ ...form, origin: val }); clearDistance(); }}
                      onSearch={searchOriginAddresses}
                      suggestions={activeStopIndex === null ? originSuggestions : []}
                      onSelectSuggestion={() => {}}
                      onClearSuggestions={() => clearSuggestions('origin')}
                      loading={loadingSuggestions === 'origin' && activeStopIndex === null}
                      label="Endereço de coleta"
                      icon={<MapPin size={14} />}
                      iconColor="text-green-500"
                      placeholder="Ex: Rua Augusta, 500, São Paulo"
                      required
                    />
                  </div>

                  {/* Paradas de Entrega */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                        <Flag size={16} className="text-red-500" />
                        Endereços de Entrega ({totalStops} {totalStops === 1 ? 'parada' : 'paradas'})
                      </h3>
                      <button
                        type="button"
                        onClick={addStop}
                        className="flex items-center gap-1.5 text-orange-600 hover:text-orange-700 text-sm font-semibold hover:bg-orange-50 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Plus size={16} />
                        Adicionar
                      </button>
                    </div>

                    {/* Stop Cards */}
                    <div className="space-y-3">
                      {form.stops.map((stop, index) => (
                        <div key={stop.id} className="relative bg-slate-50 border border-slate-200 rounded-xl p-4 hover:border-orange-300 transition-colors">
                          <div className="flex items-start gap-3">
                            {/* Stop number + reorder */}
                            <div className="flex flex-col items-center gap-1 pt-0.5">
                              <div className="w-7 h-7 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md">
                                {stop.order}
                              </div>
                              <div className="flex flex-col gap-0.5 mt-1">
                                <button type="button" onClick={() => moveStop(index, 'up')} disabled={index === 0}
                                  className="p-0.5 hover:bg-orange-100 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                                  <ChevronUp size={14} className="text-slate-500" />
                                </button>
                                <button type="button" onClick={() => moveStop(index, 'down')} disabled={index === form.stops.length - 1}
                                  className="p-0.5 hover:bg-orange-100 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                                  <ChevronDown size={14} className="text-slate-500" />
                                </button>
                              </div>
                            </div>

                            {/* Stop Fields */}
                            <div className="flex-1 space-y-3">
                              {/* Address */}
                              <AddressInput
                                value={stop.address}
                                onChange={(val) => { updateStop(stop.id, 'address', val); setActiveStopIndex(index); clearDistance(); }}
                                onSearch={(q) => { setActiveStopIndex(index); searchDestAddresses(q); }}
                                suggestions={activeStopIndex === index ? destSuggestions : []}
                                onSelectSuggestion={() => {}}
                                onClearSuggestions={() => clearSuggestions('dest')}
                                loading={loadingSuggestions === 'dest' && activeStopIndex === index}
                                label={`Endereço da Parada ${stop.order}`}
                                icon={<MapPin size={14} />}
                                iconColor="text-red-500"
                                placeholder={`Endereço de entrega ${stop.order}...`}
                                required={index === 0}
                              />

                              {/* Recipient */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="text-xs font-medium text-slate-600 mb-1 block">Destinatário</label>
                                  <input type="text" value={stop.recipientName}
                                    onChange={(e) => updateStop(stop.id, 'recipientName', e.target.value)}
                                    placeholder="Nome do destinatário"
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
                                </div>
                                <div>
                                  <label className="text-xs font-medium text-slate-600 mb-1 block">Telefone</label>
                                  <input type="text" value={stop.recipientPhone}
                                    onChange={(e) => updateStop(stop.id, 'recipientPhone', e.target.value)}
                                    placeholder="(11) 99999-0000"
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
                                </div>
                              </div>

                              {/* Description */}
                              <div>
                                <label className="text-xs font-medium text-slate-600 mb-1 block">O que será entregue</label>
                                <input type="text" value={stop.description}
                                  onChange={(e) => updateStop(stop.id, 'description', e.target.value)}
                                  placeholder="Ex: 2 caixas, 1 envelope, documentos..."
                                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
                              </div>
                            </div>

                            {/* Remove */}
                            <button type="button" onClick={() => removeStop(stop.id)} disabled={form.stops.length <= 1}
                              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed mt-0.5">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Big Add Button */}
                    <button type="button" onClick={addStop}
                      className="w-full border-2 border-dashed border-orange-300 rounded-xl py-5 flex flex-col items-center gap-2 text-orange-500 hover:text-orange-600 hover:border-orange-400 hover:bg-orange-50/50 transition-all group">
                      <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                        <Plus size={28} />
                      </div>
                      <span className="font-bold text-sm">Adicionar mais um endereço de entrega</span>
                      <span className="text-xs text-orange-400">Clique para incluir uma nova parada no roteiro</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ===== STEP 2: MOTORISTA E CÁLCULO ===== */}
              {formStep === 2 && (
                <div className="space-y-6">
                  {/* Driver */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                      <Truck size={16} className="text-orange-500" />
                      Motorista / Entregador
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-slate-700 mb-1 block">Motorista *</label>
                        <select value={form.driverId}
                          onChange={(e) => setForm({ ...form, driverId: e.target.value })}
                          required
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500">
                          <option value="">Selecione o motorista</option>
                          {drivers.map(d => (
                            <option key={d.id} value={d.id}>
                              {d.name} ({d.type}) {d.status === 'available' ? '🟢' : d.status === 'busy' ? '🟡' : '⚫'}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700 mb-1 block">Prioridade</label>
                        <select value={form.priority}
                          onChange={(e) => setForm({ ...form, priority: e.target.value })}
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500">
                          <option value="Normal">🟢 Normal</option>
                          <option value="Alta">🟡 Alta</option>
                          <option value="Urgente">🔴 Urgente</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-slate-700 mb-1 block">Tipo</label>
                        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as 'avulsa' | 'contrato' })}
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500">
                          <option value="avulsa">Avulsa</option>
                          <option value="contrato">Contrato</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700 mb-1 block">Observações</label>
                        <input type="text" value={form.description}
                          onChange={(e) => setForm({ ...form, description: e.target.value })}
                          placeholder="Instruções especiais..."
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
                      </div>
                    </div>
                  </div>

                  {/* Route Summary + Calculate */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                      <Navigation size={16} className="text-blue-500" />
                      Cálculo de Distância e Valor
                    </h3>

                    {/* Route summary */}
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Resumo do Roteiro</p>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 bg-green-500 rounded-full" />
                          <span className="text-sm text-slate-700">{form.origin || 'Origem não definida'}</span>
                        </div>
                        {validStops.map((s, i) => (
                          <div key={s.id} className="flex items-center gap-2 pl-1">
                            <div className="w-0.5 h-3 bg-orange-300 ml-1" />
                            <div className="w-2.5 h-2.5 bg-orange-500 rounded-full" />
                            <span className="text-sm text-slate-700 truncate">
                              Parada {i + 1}: {s.address}
                              {s.recipientName && <span className="text-slate-400"> ({s.recipientName})</span>}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button type="button" onClick={handleCalculateDistance}
                      disabled={distLoading || !form.origin || validStops.length === 0}
                      className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-md shadow-blue-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm">
                      {distLoading ? (
                        <><Loader2 size={18} className="animate-spin" /> Calculando rota...</>
                      ) : (
                        <><Navigation size={18} /> Calcular Distância e Valor ({validStops.length} {validStops.length === 1 ? 'parada' : 'paradas'})</>
                      )}
                    </button>

                    {distError && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">⚠️ {distError}</div>
                    )}

                    {/* Distance Result */}
                    {distance && (
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl overflow-hidden animate-in">
                        <div className="p-4 grid grid-cols-3 gap-3">
                          <div className="text-center">
                            <Route size={18} className="text-blue-500 mx-auto mb-1" />
                            <p className="text-lg font-bold text-slate-900">{distance.distanceKm} km</p>
                            <p className="text-xs text-slate-400">Distância Total</p>
                          </div>
                          <div className="text-center">
                            <Clock size={18} className="text-purple-500 mx-auto mb-1" />
                            <p className="text-lg font-bold text-slate-900">
                              {distance.durationMin >= 60
                                ? `${Math.floor(distance.durationMin / 60)}h ${distance.durationMin % 60}min`
                                : `${distance.durationMin} min`}
                            </p>
                            <p className="text-xs text-slate-400">Tempo Estimado</p>
                          </div>
                          <div className="text-center">
                            <DollarSign size={18} className="text-green-500 mx-auto mb-1" />
                            <p className="text-lg font-bold text-green-600">
                              R$ {(calculateSuggestedPrice(
                                distance.distanceKm,
                                drivers.find(d => d.id === form.driverId)?.type || 'motorista'
                              ) + Math.max(0, validStops.length - 1) * 5).toFixed(2)}
                            </p>
                            <p className="text-xs text-slate-400">Valor Sugerido</p>
                          </div>
                        </div>
                        <div className="p-3 bg-white/50 border-t border-green-100">
                          <button type="button" onClick={handleApplySuggestedPrice}
                            className="w-full py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-all flex items-center justify-center gap-2">
                            <Zap size={14} /> Aplicar valor sugerido
                          </button>
                          {validStops.length > 1 && (
                            <p className="text-[10px] text-slate-400 text-center mt-1.5">
                              Inclui taxa de R$ 5,00 por parada adicional ({validStops.length - 1} extra{validStops.length > 2 ? 's' : ''})
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Value */}
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                        <DollarSign size={14} className="text-green-500" />
                        Valor (R$) *
                        {distance && <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">auto</span>}
                      </label>
                      <input type="number" step="0.01" value={form.value}
                        onChange={(e) => setForm({ ...form, value: e.target.value })}
                        required placeholder="0.00"
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
                    </div>
                  </div>
                </div>
              )}

              {/* ===== STEP 3: REVIEW ===== */}
              {formStep === 3 && (
                <div className="space-y-5">
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <FileText size={16} className="text-orange-500" />
                    Revisão da Entrega
                  </h3>

                  {/* Client */}
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Cliente</p>
                    <p className="font-bold text-slate-900">{clients.find(c => c.id === form.clientId)?.name}</p>
                  </div>

                  {/* Route */}
                  <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                    <p className="text-xs font-semibold text-slate-400 uppercase">
                      Roteiro ({validStops.length} parada{validStops.length > 1 ? 's' : ''})
                    </p>
                    <div className="space-y-2.5">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Play size={12} className="text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-green-600 font-semibold">COLETA</p>
                          <p className="text-sm font-semibold text-slate-900">{form.origin}</p>
                        </div>
                      </div>
                      {validStops.map((s, i) => (
                        <div key={s.id} className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-white text-xs font-bold">
                            {i + 1}
                          </div>
                          <div>
                            <p className="text-xs text-orange-600 font-semibold">PARADA {i + 1}</p>
                            <p className="text-sm font-semibold text-slate-900">{s.address}</p>
                            {s.recipientName && (
                              <p className="text-xs text-slate-500">👤 {s.recipientName}{s.recipientPhone && ` • ${s.recipientPhone}`}</p>
                            )}
                            {s.description && (
                              <p className="text-xs text-slate-500">📦 {s.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Driver + Priority */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-xl p-4">
                      <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Motorista</p>
                      <p className="font-bold text-slate-900">{drivers.find(d => d.id === form.driverId)?.name}</p>
                      <p className="text-xs text-slate-500">{drivers.find(d => d.id === form.driverId)?.vehicle}</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4">
                      <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Prioridade</p>
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${priorityColors[form.priority]}`}>
                        {form.priority}
                      </span>
                    </div>
                  </div>

                  {/* Value */}
                  <div className="bg-green-50 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-green-700">R$ {parseFloat(form.value || '0').toFixed(2)}</p>
                    <p className="text-xs text-green-500 mt-1">Valor da Entrega</p>
                    {distance && (
                      <p className="text-xs text-green-600 mt-2">📏 {distance.distanceKm}km • ⏱️ {distance.durationMin}min</p>
                    )}
                  </div>

                  {form.description && (
                    <div className="bg-yellow-50 rounded-xl p-3 border border-yellow-200">
                      <p className="text-xs font-semibold text-yellow-600 mb-1">📝 Observações</p>
                      <p className="text-sm text-yellow-800">{form.description}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <div>
                {formStep > 1 && (
                  <button onClick={() => setFormStep(s => s - 1)}
                    className="px-5 py-2.5 text-slate-600 hover:text-slate-800 font-medium text-sm rounded-xl hover:bg-slate-100 transition-colors">
                    ← Voltar
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button onClick={handleCloseModal} className="px-5 py-2.5 text-slate-500 hover:text-slate-700 font-medium text-sm">
                  Cancelar
                </button>
                {formStep === 1 && (
                  <button onClick={() => setFormStep(2)} disabled={!canGoStep2}
                    className="px-6 py-2.5 bg-orange-500 text-white font-semibold text-sm rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md">
                    Próximo →
                  </button>
                )}
                {formStep === 2 && (
                  <button onClick={() => setFormStep(3)} disabled={!canGoStep3}
                    className="px-6 py-2.5 bg-orange-500 text-white font-semibold text-sm rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md">
                    Próximo →
                  </button>
                )}
                {formStep === 3 && (
                  <button onClick={handleSubmit} disabled={saving}
                    className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold text-sm rounded-xl hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/25 flex items-center gap-2">
                    {saving ? <><Loader2 size={16} className="animate-spin" /> Salvando...</> : '✓ Registrar Entrega'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============ DETAIL MODAL ============ */}
      {showDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10">
              <h2 className="text-xl font-bold text-slate-900">Detalhes da Entrega</h2>
              <button onClick={() => setShowDetail(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">ID</span>
                <span className="text-sm font-mono font-medium">#{showDetail.id.substring(0, 8).toUpperCase()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Cliente</span>
                <span className="text-sm font-medium">{showDetail.clientName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Motorista</span>
                <span className="text-sm font-medium">{showDetail.driverName}</span>
              </div>

              {/* Route visualization */}
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Roteiro</p>
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center gap-0.5 mt-1">
                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full" />
                    <div className="w-0.5 h-6 bg-gradient-to-b from-green-400 to-red-400 rounded-full" />
                    <div className="w-2.5 h-2.5 bg-red-500 rounded-full" />
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-green-600 font-medium">COLETA</p>
                      <p className="text-sm text-slate-800">{showDetail.origin}</p>
                    </div>
                    <div>
                      <p className="text-xs text-red-600 font-medium">ENTREGA</p>
                      <p className="text-sm text-slate-800">{showDetail.destination}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Status</span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${statusColors[showDetail.status]}`}>
                  {statusLabels[showDetail.status]}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Valor</span>
                <span className="text-lg font-bold text-orange-600">R$ {showDetail.value.toFixed(2)}</span>
              </div>

              {/* Distance info */}
              {showDetail.description && showDetail.description.includes('📏') && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                  <p className="text-sm text-blue-800">
                    {showDetail.description.split('|').filter(s => s.includes('📏') || s.includes('⏱️')).join(' • ')}
                  </p>
                </div>
              )}

              {/* Stops info */}
              {showDetail.description && showDetail.description.includes('📍') && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 space-y-1">
                  <p className="text-xs font-semibold text-orange-600 uppercase">Paradas do Roteiro</p>
                  {showDetail.description.split('|')
                    .filter(s => s.includes('📍'))
                    .map((s, i) => (
                      <p key={i} className="text-xs text-orange-800">{s.trim()}</p>
                    ))}
                </div>
              )}

              {/* Status Actions */}
              {showDetail.status !== 'delivered' && showDetail.status !== 'cancelled' && (
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-sm font-medium text-slate-700 mb-3">Atualizar Status:</p>
                  <div className="flex gap-2">
                    {showDetail.status === 'pending' && (
                      <button onClick={() => { handleStatusChange(showDetail.id, 'in_transit'); setShowDetail({...showDetail, status: 'in_transit'}); }}
                        className="flex-1 py-2 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600">
                        Em Trânsito
                      </button>
                    )}
                    {(showDetail.status === 'pending' || showDetail.status === 'in_transit') && (
                      <button onClick={() => { handleStatusChange(showDetail.id, 'delivered'); setShowDetail({...showDetail, status: 'delivered'}); }}
                        className="flex-1 py-2 bg-green-500 text-white rounded-xl text-sm font-medium hover:bg-green-600">
                        Entregue
                      </button>
                    )}
                    <button onClick={() => { handleStatusChange(showDetail.id, 'cancelled'); setShowDetail({...showDetail, status: 'cancelled'}); }}
                      className="flex-1 py-2 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600">
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
