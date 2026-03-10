import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Edit2, X, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { SparePart } from '../types';

export default function SparePartsManager() {
  const [parts, setParts] = useState<SparePart[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Form states for adding/editing
  const [editForm, setEditForm] = useState<Partial<SparePart>>({
    date: new Date().toISOString().split('T')[0],
    description: '',
    cost: 0,
    quantity: 1
  });

  useEffect(() => {
    loadParts();
  }, []);

  const loadParts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('spare_parts')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setParts(data || []);
    } catch (error) {
      console.error('Error loading parts:', error);
    } finally {
      setLoading(false);
    }
  };

  const startAdding = () => {
    setIsAdding(true);
    setEditForm({
      date: new Date().toISOString().split('T')[0],
      description: '',
      cost: 0
    });
  };

  const cancelAdding = () => {
    setIsAdding(false);
  };

  const startEditing = (part: SparePart) => {
    setEditingId(part.id!);
    setEditForm({ ...part });
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const handleSave = async (id?: string) => {
    if (!editForm.date || !editForm.description) {
      alert('Por favor complete la fecha y descripción');
      return;
    }

    try {
      if (id) {
        // Update
        const { error } = await supabase
          .from('spare_parts')
          .update({
            date: editForm.date,
            description: editForm.description,
            cost: Number(editForm.cost) || 0,
            quantity: Number(editForm.quantity) || 1
          })
          .eq('id', id);

        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase
          .from('spare_parts')
          .insert([{
            date: editForm.date,
            description: editForm.description,
            cost: Number(editForm.cost) || 0,
            quantity: Number(editForm.quantity) || 1
          }]);

        if (error) throw error;
      }

      setEditingId(null);
      setIsAdding(false);
      await loadParts();
    } catch (error) {
      console.error('Error saving part:', error);
      alert('Error al guardar el repuesto');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que desea eliminar este registro?')) return;

    try {
      const { error } = await supabase
        .from('spare_parts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadParts();
    } catch (error) {
      console.error('Error deleting part:', error);
      alert('Error al eliminar el repuesto');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading && parts.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Cargando repuestos...
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
        <div className="p-6 bg-gray-50 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Gestión de Repuestos</h2>
          <button
            onClick={startAdding}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold shadow-md"
          >
            <Plus size={18} />
            Agregar Repuesto
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-800 text-white uppercase text-xs font-bold tracking-wider">
                <th className="px-6 py-4 border-r border-gray-700 w-32">Fecha</th>
                <th className="px-6 py-4 border-r border-gray-700">Repuesto</th>
                <th className="px-6 py-4 border-r border-gray-700 w-24 text-center">Cantidad</th>
                <th className="px-6 py-4 border-r border-gray-700 w-40">Costo</th>
                <th className="px-6 py-4 w-32 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isAdding && (
                <tr className="bg-blue-50">
                  <td className="px-4 py-3 border-r">
                    <input
                      type="date"
                      value={editForm.date}
                      onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                      className="w-full bg-white border-2 border-blue-300 rounded px-2 py-1 outline-none focus:border-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3 border-r">
                    <input
                      type="text"
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      placeholder="Descripción del repuesto..."
                      className="w-full bg-white border-2 border-blue-300 rounded px-2 py-1 outline-none focus:border-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3 border-r text-center">
                    <input
                      type="number"
                      min={1}
                      value={editForm.quantity ?? 1}
                      onChange={(e) =>
                        setEditForm({ ...editForm, quantity: Number(e.target.value) })
                      }
                      className="w-20 bg-white border-2 border-blue-300 rounded px-2 py-1 outline-none focus:border-blue-500 text-center font-semibold"
                    />
                  </td>
                  <td className="px-4 py-3 border-r">
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                      <input
                        type="number"
                        value={editForm.cost || ''}
                        onChange={(e) => setEditForm({ ...editForm, cost: Number(e.target.value) })}
                        placeholder="0"
                        className="w-full bg-white border-2 border-blue-300 rounded pl-6 pr-2 py-1 outline-none focus:border-blue-500 text-right font-semibold"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => handleSave()} className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 shadow-sm">
                        <Check size={18} />
                      </button>
                      <button onClick={cancelAdding} className="p-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 shadow-sm">
                        <X size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              )}

              {parts.length === 0 && !isAdding ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500 italic">
                    No hay repuestos registrados. Haga clic en "Agregar Repuesto" para comenzar.
                  </td>
                </tr>
              ) : (
                parts.map((part) => (
                  <tr key={part.id} className="hover:bg-gray-50 transition-colors">
                    {editingId === part.id ? (
                      <>
                        <td className="px-4 py-3 border-r">
                          <input
                            type="date"
                            value={editForm.date}
                            onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                            className="w-full bg-white border-2 border-blue-300 rounded px-2 py-1 outline-none focus:border-blue-500"
                          />
                        </td>
                        <td className="px-4 py-3 border-r">
                          <input
                            type="text"
                            value={editForm.description}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            className="w-full bg-white border-2 border-blue-300 rounded px-2 py-1 outline-none focus:border-blue-500"
                          />
                        </td>
                        <td className="px-4 py-3 border-r text-center">
                          <input
                            type="number"
                            min={1}
                            value={editForm.quantity ?? 1}
                            onChange={(e) =>
                              setEditForm({ ...editForm, quantity: Number(e.target.value) })
                            }
                            className="w-20 bg-white border-2 border-blue-300 rounded px-2 py-1 outline-none focus:border-blue-500 text-center font-semibold"
                          />
                        </td>
                        <td className="px-4 py-3 border-r">
                          <div className="relative">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                            <input
                              type="number"
                              value={editForm.cost || ''}
                              onChange={(e) => setEditForm({ ...editForm, cost: Number(e.target.value) })}
                              className="w-full bg-white border-2 border-blue-300 rounded pl-6 pr-2 py-1 outline-none focus:border-blue-500 text-right font-semibold"
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center gap-2">
                            <button onClick={() => handleSave(part.id)} className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 shadow-sm">
                              <Check size={18} />
                            </button>
                            <button onClick={cancelEditing} className="p-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 shadow-sm">
                              <X size={18} />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 border-r border-gray-100 text-gray-600 font-medium">
                          {new Date(part.date + 'T00:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 border-r border-gray-100 text-gray-800 font-semibold">
                          {part.description}
                        </td>
                        <td className="px-6 py-4 border-r border-gray-100 text-center text-gray-800 font-semibold">
                          {part.quantity ?? 1}
                        </td>
                        <td className="px-6 py-4 border-r border-gray-100 text-right font-bold text-gray-900">
                          {formatCurrency(part.cost)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => startEditing(part)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(part.id!)}
                              className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
