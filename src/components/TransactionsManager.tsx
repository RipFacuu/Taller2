import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Edit2, X, Check, Calendar as CalendarIcon, ChevronDown, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Transaction } from '../types';

export default function TransactionsManager() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({});

  // Form states
  const [form, setForm] = useState<Partial<Transaction>>({
    date: new Date().toISOString().split('T')[0],
    description: '',
    spare_parts_income: 0,
    general_income: 0,
    workshop_expenses: 0,
    spare_parts_expense: 0
  });

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) throw error;
      setTransactions(data || []);
      
      // Expand most recent date by default
      if (data && data.length > 0) {
        const latestDate = data[0].date;
        setExpandedDates(prev => ({ ...prev, [latestDate]: true }));
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (id?: string) => {
    if (!form.description) {
      alert('Por favor ingrese una descripción');
      return;
    }

    try {
      const dataToSave = {
        date: form.date,
        description: form.description,
        spare_parts_income: Number(form.spare_parts_income) || 0,
        general_income: Number(form.general_income) || 0,
        workshop_expenses: Number(form.workshop_expenses) || 0,
        spare_parts_expense: Number(form.spare_parts_expense) || 0
      };

      if (id) {
        const { error } = await supabase.from('transactions').update(dataToSave).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('transactions').insert([dataToSave]);
        if (error) throw error;
      }

      setIsAdding(false);
      setEditingId(null);
      await loadTransactions();
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert('Error al guardar la transacción');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que desea eliminar esta transacción?')) return;
    try {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) throw error;
      await loadTransactions();
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const startEditing = (t: Transaction) => {
    setEditingId(t.id!);
    setForm({ ...t });
  };

  const toggleDate = (date: string) => {
    setExpandedDates(prev => ({ ...prev, [date]: !prev[date] }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Group transactions by date
  const groupedTransactions = transactions.reduce((acc, t) => {
    if (!acc[t.date]) acc[t.date] = [];
    acc[t.date].push(t);
    return acc;
  }, {} as Record<string, Transaction[]>);

  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => b.localeCompare(a));

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
        <div className="p-6 bg-gray-800 text-white flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <CalendarIcon size={24} />
            Gastos / Entradas (Flujo de Caja)
          </h2>
          <button
            onClick={() => {
              setIsAdding(true);
              setForm({
                date: new Date().toISOString().split('T')[0],
                description: '',
                spare_parts_income: 0,
                general_income: 0,
                workshop_expenses: 0,
                spare_parts_expense: 0
              });
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold shadow-md"
          >
            <Plus size={18} />
            Nueva Transacción
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700 uppercase text-[10px] font-black tracking-widest border-b-2 border-gray-200">
                <th className="px-4 py-4 w-12"></th>
                <th className="px-4 py-4">Descripción</th>
                <th className="px-4 py-4 text-right text-green-700">Cobros repuestos</th>
                <th className="px-4 py-4 text-right text-emerald-700">Entradas</th>
                <th className="px-4 py-4 text-right text-red-700">Gastos taller</th>
                <th className="px-4 py-4 text-right text-orange-700">Repuestos</th>
                <th className="px-4 py-4 w-24 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isAdding && (
                <tr className="bg-blue-50 border-b-2 border-blue-200">
                  <td className="px-4 py-3"></td>
                  <td className="px-2 py-3">
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm({...form, date: e.target.value})}
                      className="block w-full mb-1 text-xs border rounded p-1"
                    />
                    <input
                      type="text"
                      value={form.description}
                      onChange={(e) => setForm({...form, description: e.target.value})}
                      placeholder="Descripción..."
                      className="w-full bg-white border-2 border-blue-200 rounded px-2 py-1 outline-none focus:border-blue-500 font-semibold"
                    />
                  </td>
                  <td className="px-2 py-3">
                    <input
                      type="number"
                      value={form.spare_parts_income || ''}
                      onChange={(e) => setForm({...form, spare_parts_income: Number(e.target.value)})}
                      className="w-full text-right border-2 border-blue-200 rounded px-2 py-1 font-bold text-green-700"
                    />
                  </td>
                  <td className="px-2 py-3">
                    <input
                      type="number"
                      value={form.general_income || ''}
                      onChange={(e) => setForm({...form, general_income: Number(e.target.value)})}
                      className="w-full text-right border-2 border-blue-200 rounded px-2 py-1 font-bold text-emerald-700"
                    />
                  </td>
                  <td className="px-2 py-3">
                    <input
                      type="number"
                      value={form.workshop_expenses || ''}
                      onChange={(e) => setForm({...form, workshop_expenses: Number(e.target.value)})}
                      className="w-full text-right border-2 border-blue-200 rounded px-2 py-1 font-bold text-red-700"
                    />
                  </td>
                  <td className="px-2 py-3">
                    <input
                      type="number"
                      value={form.spare_parts_expense || ''}
                      onChange={(e) => setForm({...form, spare_parts_expense: Number(e.target.value)})}
                      className="w-full text-right border-2 border-blue-200 rounded px-2 py-1 font-bold text-orange-700"
                    />
                  </td>
                  <td className="px-2 py-3 text-center">
                    <div className="flex justify-center gap-1">
                      <button onClick={() => handleSave()} className="p-1.5 bg-green-500 text-white rounded hover:bg-green-600 shadow-sm">
                        <Check size={16} />
                      </button>
                      <button onClick={() => setIsAdding(false)} className="p-1.5 bg-gray-400 text-white rounded hover:bg-gray-500 shadow-sm">
                        <X size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )}

              {sortedDates.map(date => {
                const dayTransactions = groupedTransactions[date];
                const isExpanded = expandedDates[date];
                
                // Calculate subtotals
                const subtotals = dayTransactions.reduce((acc, t) => ({
                  spi: acc.spi + t.spare_parts_income,
                  gi: acc.gi + t.general_income,
                  we: acc.we + t.workshop_expenses,
                  spe: acc.spe + t.spare_parts_expense
                }), { spi: 0, gi: 0, we: 0, spe: 0 });

                return (
                  <div key={date} className="contents">
                    <tr 
                      onClick={() => toggleDate(date)}
                      className="bg-gray-50 border-y border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <td className="px-4 py-3 text-gray-400">
                        {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                      </td>
                      <td colSpan={6} className="px-2 py-3">
                        <span className="text-sm font-black text-gray-800 tracking-tighter uppercase">
                          {new Date(date + 'T00:00:00').toLocaleDateString('es-AR', { 
                            weekday: 'long', 
                            day: '2-digit', 
                            month: '2-digit', 
                            year: 'numeric' 
                          })}
                        </span>
                      </td>
                    </tr>
                    
                    {isExpanded && dayTransactions.map(t => (
                      <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                        <td className="px-4 py-3"></td>
                        {editingId === t.id ? (
                          <>
                            <td className="px-2 py-2">
                              <input
                                type="text"
                                value={form.description}
                                onChange={(e) => setForm({...form, description: e.target.value})}
                                className="w-full border-2 border-blue-200 rounded px-2 py-1 outline-none font-semibold"
                              />
                            </td>
                            <td className="px-2 py-2">
                              <input
                                type="number"
                                value={form.spare_parts_income || ''}
                                onChange={(e) => setForm({...form, spare_parts_income: Number(e.target.value)})}
                                className="w-full text-right border-2 border-blue-200 rounded px-2 py-1 font-bold text-green-700"
                              />
                            </td>
                            <td className="px-2 py-2">
                              <input
                                type="number"
                                value={form.general_income || ''}
                                onChange={(e) => setForm({...form, general_income: Number(e.target.value)})}
                                className="w-full text-right border-2 border-blue-200 rounded px-2 py-1 font-bold text-emerald-700"
                              />
                            </td>
                            <td className="px-2 py-2">
                              <input
                                type="number"
                                value={form.workshop_expenses || ''}
                                onChange={(e) => setForm({...form, workshop_expenses: Number(e.target.value)})}
                                className="w-full text-right border-2 border-blue-200 rounded px-2 py-1 font-bold text-red-700"
                              />
                            </td>
                            <td className="px-2 py-2">
                              <input
                                type="number"
                                value={form.spare_parts_expense || ''}
                                onChange={(e) => setForm({...form, spare_parts_expense: Number(e.target.value)})}
                                className="w-full text-right border-2 border-blue-200 rounded px-2 py-1 font-bold text-orange-700"
                              />
                            </td>
                            <td className="px-2 py-2 text-center">
                              <div className="flex justify-center gap-1">
                                <button onClick={() => handleSave(t.id)} className="p-1.5 bg-green-500 text-white rounded shadow-sm">
                                  <Check size={16} />
                                </button>
                                <button onClick={() => setEditingId(null)} className="p-1.5 bg-gray-400 text-white rounded shadow-sm">
                                  <X size={16} />
                                </button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-4 py-3 text-gray-700 font-medium">{t.description}</td>
                            <td className={`px-4 py-3 text-right font-bold ${t.spare_parts_income > 0 ? 'text-green-600' : 'text-gray-300'}`}>
                              {t.spare_parts_income > 0 ? formatCurrency(t.spare_parts_income) : '-'}
                            </td>
                            <td className={`px-4 py-3 text-right font-bold ${t.general_income > 0 ? 'text-emerald-600' : 'text-gray-300'}`}>
                              {t.general_income > 0 ? formatCurrency(t.general_income) : '-'}
                            </td>
                            <td className={`px-4 py-3 text-right font-bold ${t.workshop_expenses > 0 ? 'text-red-600' : 'text-gray-300'}`}>
                              {t.workshop_expenses > 0 ? formatCurrency(t.workshop_expenses) : '-'}
                            </td>
                            <td className={`px-4 py-3 text-right font-bold ${t.spare_parts_expense > 0 ? 'text-orange-600' : 'text-gray-300'}`}>
                              {t.spare_parts_expense > 0 ? formatCurrency(t.spare_parts_expense) : '-'}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => startEditing(t)} className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                                  <Edit2 size={16} />
                                </button>
                                <button onClick={() => handleDelete(t.id!)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                    
                    {isExpanded && (
                      <tr className="bg-gray-100/50 border-t-2 border-gray-200">
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3 text-xs font-black text-gray-500 uppercase tracking-tighter">Subtotales Día</td>
                        <td className="px-4 py-3 text-right font-black text-green-800">{formatCurrency(subtotals.spi)}</td>
                        <td className="px-4 py-3 text-right font-black text-emerald-800">{formatCurrency(subtotals.gi)}</td>
                        <td className="px-4 py-3 text-right font-black text-red-800">{formatCurrency(subtotals.we)}</td>
                        <td className="px-4 py-3 text-right font-black text-orange-800">{formatCurrency(subtotals.spe)}</td>
                        <td className="px-4 py-3"></td>
                      </tr>
                    )}
                  </div>
                );
              })}

              {sortedDates.length === 0 && !isAdding && (
                <tr>
                  <td colSpan={8} className="px-6 py-20 text-center text-gray-400 font-medium italic">
                    No hay transacciones registradas. Use el botón "Nueva Transacción" para empezar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
