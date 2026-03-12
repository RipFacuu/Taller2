import { useState, useEffect } from 'react';
import { Search, Calendar, User, Car, DollarSign, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { ServiceRecord, ServiceItem, Category } from '../types';
import NotebookForm from './NotebookForm';

interface HistoricalRecordsProps {
  category: Category;
}

export default function HistoricalRecords({ category }: HistoricalRecordsProps) {
  const [records, setRecords] = useState<ServiceRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<ServiceRecord | null>(null);
  const [items, setItems] = useState<ServiceItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadRecords();
  }, [category]);

  const loadRecords = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('service_records')
        .select('*')
        .eq('category', category)
        .order('date', { ascending: false });

      if (error) throw error;
      setRecords(data || []);
      
      // If we were editing, update the selected record with fresh data
      if (selectedRecord) {
        const updated = (data || []).find(r => r.id === selectedRecord.id);
        if (updated) setSelectedRecord(updated);
      }
    } catch (error) {
      console.error('Error al cargar registros:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadItems = async (recordId: string) => {
    try {
      const { data, error } = await supabase
        .from('service_items')
        .select('*')
        .eq('service_record_id', recordId)
        .order('date', { ascending: true }) // Order by date from oldest to newest
        .order('order_index', { ascending: true });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error al cargar ítems:', error);
    }
  };

  const handleRecordClick = async (record: ServiceRecord) => {
    if (isEditing) return; // Don't allow switching while editing
    setSelectedRecord(record);
    if (record.id) {
      await loadItems(record.id);
    }
  };

  const handleEditSaved = async () => {
    setIsEditing(false);
    await loadRecords();
    if (selectedRecord?.id) {
      await loadItems(selectedRecord.id);
    }
  };

  const handleDelete = async (recordId: string) => {
    if (!confirm('¿Está seguro de que desea eliminar esta ficha? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('service_records')
        .delete()
        .eq('id', recordId);

      if (error) throw error;

      // Remove the record from the local state
      setRecords(records.filter(r => r.id !== recordId));
      setSelectedRecord(null);
      setItems([]);
      alert('Ficha eliminada exitosamente.');
    } catch (error) {
      console.error('Error al eliminar la ficha:', error);
      alert('No se pudo eliminar la ficha.');
    }
  };

  const filteredRecords = records.filter(record =>
    record.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isEditing && selectedRecord) {
    return (
      <NotebookForm 
        category={category}
        editRecord={selectedRecord}
        editItems={items}
        onSaved={handleEditSaved}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Cargando registros...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por cliente, patente o marca..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3 overflow-y-auto" style={{ maxHeight: '700px' }}>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Fichas de Servicio ({filteredRecords.length})
          </h3>
          {filteredRecords.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay registros</p>
          ) : (
            filteredRecords.map((record) => (
              <div
                key={record.id}
                onClick={() => handleRecordClick(record)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedRecord?.id === record.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-gray-600" />
                    <span className="font-semibold text-gray-900">{record.client_name}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Calendar size={14} />
                    {new Date(record.date).toLocaleDateString('es-AR')}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <Car size={14} />
                  <span>{record.brand} {record.model}</span>
                  {record.plate && <span className="font-mono">• {record.plate}</span>}
                </div>
                <div className="flex justify-between items-center mt-2 pt-2 border-t">
                  <div className="flex items-center gap-1 text-sm">
                    <DollarSign size={14} className="text-green-600" />
                    <span className="font-semibold text-green-600">${record.total.toFixed(2)}</span>
                  </div>
                  {record.balance > 0 && (
                    <span className="text-sm font-semibold text-red-600">
                      Debe: ${record.balance.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div>
          {selectedRecord ? (
            <div className="bg-white rounded-xl shadow-xl p-6 border border-gray-200 sticky top-4">
              <div className="flex justify-between items-center mb-6 pb-4 border-b">
                <h3 className="text-xl font-bold text-gray-900">Detalle de la Ficha</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold shadow-md"
                  >
                    <Edit2 size={18} />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(selectedRecord.id!)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-semibold shadow-md"
                  >
                    <Trash2 size={18} />
                    Eliminar
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Cliente</p>
                  <p className="text-gray-900 font-semibold">{selectedRecord.client_name}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Teléfono</p>
                  <p className="text-gray-900 font-semibold">{selectedRecord.phone || '-'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Fecha</p>
                  <p className="text-gray-900 font-semibold">{new Date(selectedRecord.date).toLocaleDateString('es-AR')}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Marca / Modelo</p>
                  <p className="text-gray-900 font-semibold">{selectedRecord.brand} {selectedRecord.model}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Patente</p>
                  <p className="text-gray-900 font-mono font-bold">{selectedRecord.plate || '-'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Kilómetros</p>
                  <p className="text-gray-900 font-semibold">{selectedRecord.kilometers.toLocaleString()}</p>
                </div>
              </div>

              {items.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 ml-1">Trabajos Realizados</h4>
                  <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                    {Object.entries(
                      items.reduce((acc, item) => {
                        if (!acc[item.date]) acc[item.date] = [];
                        acc[item.date].push(item);
                        return acc;
                      }, {} as Record<string, typeof items>)
                    )
                      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB)) // Sort dates oldest to newest
                      .map(([date, dayItems]) => (
                        <div key={date} className="border-b last:border-b-0 border-gray-200">
                          <div className="bg-gray-100 px-4 py-1.5 border-b border-gray-200 flex justify-between items-center">
                            <span className="text-[10px] font-black text-gray-500 uppercase">
                              {new Date(date + 'T00:00:00').toLocaleDateString('es-AR')}
                            </span>
                            {dayItems[0]?.kilometers ? (
                              <span className="text-[10px] text-gray-500 font-bold uppercase">
                                {dayItems[0].kilometers.toLocaleString('es-AR')} km
                              </span>
                            ) : null}
                          </div>
                          {dayItems.map((item, idx) => (
                            <div
                              key={item.id || idx}
                              className={`flex justify-between items-center px-4 py-3 bg-white ${
                                idx !== dayItems.length - 1 ? 'border-b border-gray-50' : ''
                              }`}
                            >
                              <span className="text-gray-700 font-medium">{item.description}</span>
                            </div>
                          ))}
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <div className="border-t pt-6 space-y-3">
                <div className="flex justify-between items-center px-2">
                  <span className="font-bold text-gray-500 uppercase text-xs">Total:</span>
                  <span className="text-2xl font-black text-gray-900">
                    $ {selectedRecord.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center px-2">
                  <span className="font-bold text-gray-500 uppercase text-xs">Pago:</span>
                  <div className="text-right">
                    <span className="text-xl font-bold text-green-600">
                      $ {selectedRecord.payment.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </span>
                    {selectedRecord.payment_method && (
                      <p className="text-xs font-bold text-gray-400 uppercase mt-1">
                        {selectedRecord.payment_method}
                      </p>
                    )}
                  </div>
                </div>
                {selectedRecord.balance > 0 && (
                  <div className="flex justify-between items-center p-4 bg-red-50 rounded-xl border border-red-100 mt-4">
                    <span className="font-bold text-red-600 uppercase text-xs">Saldo Pendiente:</span>
                    <span className="text-2xl font-black text-red-600">
                      $ {selectedRecord.balance.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
              <p>Selecciona una ficha para ver los detalles</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
