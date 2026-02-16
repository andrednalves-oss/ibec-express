import { useState } from 'react';
import { Plus, Search, X, Truck, Star, Phone, Hash, Edit2, Trash2, Loader2, RefreshCw } from 'lucide-react';
import { Driver } from '../types';
import { useDrivers } from '../hooks/useSupabase';

export function DriversPage() {
  const { drivers, loading, addDriver, updateDriver, deleteDriver, fetchDrivers } = useDrivers();
  const [showModal, setShowModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    vehicle: '',
    plate: '',
    type: 'motorista' as 'motorista' | 'motoboy',
  });

  const resetForm = () => {
    setForm({ name: '', phone: '', vehicle: '', plate: '', type: 'motorista' });
    setEditingDriver(null);
  };

  const handleOpenNew = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEdit = (driver: Driver) => {
    setEditingDriver(driver);
    setForm({
      name: driver.name,
      phone: driver.phone,
      vehicle: driver.vehicle,
      plate: driver.plate,
      type: driver.type,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este motorista?')) {
      await deleteDriver(id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingDriver) {
        await updateDriver(editingDriver.id, form);
      } else {
        await addDriver(form);
      }
      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error('Erro ao salvar motorista:', err);
    }
    setSaving(false);
  };

  const filtered = drivers.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || d.type === filterType;
    return matchesSearch && matchesType;
  });

  const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
    available: { label: 'Disponível', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
    busy: { label: 'Ocupado', color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
    offline: { label: 'Offline', color: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' },
  };

  const totalMotoristas = drivers.filter(d => d.type === 'motorista').length;
  const totalMotoboys = drivers.filter(d => d.type === 'motoboy').length;
  const available = drivers.filter(d => d.status === 'available').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-slate-500">Carregando motoristas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">🚚 Motoristas & Motoboys</h1>
          <p className="text-slate-500 mt-1">Gerencie sua equipe de entregas</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => fetchDrivers()} className="p-3 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-all" title="Atualizar">
            <RefreshCw size={20} />
          </button>
          <button onClick={handleOpenNew} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/30 active:scale-[0.98]">
            <Plus size={20} />
            Novo Cadastro
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 text-center">
          <p className="text-2xl font-bold text-slate-900">{totalMotoristas}</p>
          <p className="text-sm text-slate-500">Motoristas</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 text-center">
          <p className="text-2xl font-bold text-slate-900">{totalMotoboys}</p>
          <p className="text-sm text-slate-500">Motoboys</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-green-200 bg-green-50/50 text-center">
          <p className="text-2xl font-bold text-green-700">{available}</p>
          <p className="text-sm text-green-600">Disponíveis</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Buscar motorista..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
        </div>
        <div className="flex gap-2">
          {['all', 'motorista', 'motoboy'].map((t) => (
            <button key={t} onClick={() => setFilterType(t)} className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${filterType === t ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              {t === 'all' ? 'Todos' : t === 'motorista' ? 'Motoristas' : 'Motoboys'}
            </button>
          ))}
        </div>
      </div>

      {/* Driver Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((driver) => {
          const st = statusConfig[driver.status];
          return (
            <div key={driver.id} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-orange-500/20">
                    {driver.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{driver.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${driver.type === 'motorista' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                      {driver.type === 'motorista' ? 'Motorista' : 'Motoboy'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(driver)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={14} /></button>
                  <button onClick={() => handleDelete(driver.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                </div>
              </div>

              <div className="space-y-2.5 mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Phone size={14} className="text-slate-400" />
                  {driver.phone}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Truck size={14} className="text-slate-400" />
                  {driver.vehicle}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Hash size={14} className="text-slate-400" />
                  {driver.plate}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${st.dot}`} />
                    <span className={`text-xs px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <Star size={12} className="text-yellow-400 fill-yellow-400" />
                    {driver.rating}
                  </div>
                  <span>{driver.deliveries} entregas</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
          <Truck size={48} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500">Nenhum motorista encontrado</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{editingDriver ? 'Editar' : 'Novo'} Cadastro</h2>
                <p className="text-sm text-slate-500">Preencha os dados do motorista/motoboy</p>
              </div>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Nome Completo</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Nome do motorista" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Telefone</label>
                <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required placeholder="(11) 99999-0000" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Veículo</label>
                  <input type="text" value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })} required placeholder="Ex: Honda CG 160" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Placa</label>
                  <input type="text" value={form.plate} onChange={(e) => setForm({ ...form, plate: e.target.value })} required placeholder="ABC-1234" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Tipo</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as 'motorista' | 'motoboy' })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500">
                  <option value="motorista">Motorista</option>
                  <option value="motoboy">Motoboy</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">Cancelar</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl text-sm font-semibold hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/30 disabled:opacity-60 flex items-center justify-center gap-2">
                  {saving ? <><Loader2 size={16} className="animate-spin" /> Salvando...</> : editingDriver ? 'Salvar Alterações' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
