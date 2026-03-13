import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { ServiceItem, Category, ServiceRecord } from '../types';

interface NotebookFormProps {
  category: Category;
  onSaved?: () => void;
  editRecord?: ServiceRecord | null;
  editItems?: ServiceItem[];
  onCancel?: () => void;
}

export default function NotebookForm({ 
  category, 
  onSaved, 
  editRecord, 
  editItems,
  onCancel 
}: NotebookFormProps) {
  const [clientName, setClientName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [plate, setPlate] = useState('');
  const [kilometers, setKilometers] = useState('');
  const [items, setItems] = useState<ServiceItem[]>([
    { description: '', amount: 0, date: new Date().toISOString().split('T')[0], order_index: 0, kilometers: 0 }
  ]);
  const [total, setTotal] = useState('');
  const [payment, setPayment] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editRecord) {
      setClientName(editRecord.client_name);
      setPhone(editRecord.phone || '');
      setDate(editRecord.date);
      setBrand(editRecord.brand || '');
      setModel(editRecord.model || '');
      setPlate(editRecord.plate || '');
      setKilometers(editRecord.kilometers?.toString() || '');
      setTotal(editRecord.total?.toString() || '');
      setPayment(editRecord.payment?.toString() || '');
      setPaymentMethod(editRecord.payment_method || '');
      
      if (editItems && editItems.length > 0) {
        setItems(editItems.map(item => ({ ...item })));
      }
    } else {
      // Default item for new records
      setItems([{ description: '', amount: 0, date: new Date().toISOString().split('T')[0], order_index: 0, kilometers: 0 }]);
      setTotal('');
    }
  }, [editRecord, editItems]);

  const numericTotal = Number(total) || 0;
  const balance = numericTotal - (Number(payment) || 0);

  const addItem = () => {
    const today = new Date().toISOString().split('T')[0];
    const lastItem = items[items.length - 1];
    const lastDate = lastItem?.date || today;
    const lastKm = typeof lastItem?.kilometers === 'number' ? lastItem.kilometers : 0;

    setItems([
      ...items,
      {
        description: '',
        amount: 0,
        date: lastDate,
        order_index: items.length,
        kilometers: lastKm,
      },
    ]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof ServiceItem, value: any) => {
    setItems(prevItems => {
      const newItems = [...prevItems];
      newItems[index] = { ...newItems[index], [field]: value };
      return newItems;
    });
  };

  const updateItemsForDate = (date: string, field: keyof ServiceItem, value: any) => {
    setItems(prevItems => {
      return prevItems.map(item => 
        item.date === date ? { ...item, [field]: value } : item
      );
    });
  };

  const updateKilometersForDate = (date: string, value: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.date === date ? { ...item, kilometers: value } : item
      )
    );
  };

  const handleSave = async () => {
    if (!clientName.trim()) {
      alert('Por favor ingrese el nombre del cliente');
      return;
    }

    setSaving(true);
    try {
      const recordData = {
        category,
        client_name: clientName,
        phone,
        date,
        brand,
        model,
        plate,
        kilometers: Number(kilometers) || 0,
        total: numericTotal,
        payment: Number(payment) || 0,
        payment_method: paymentMethod,
        balance
      };

      let recordId: string;

      if (editRecord?.id) {
        // UPDATE existing record
        const { error: recordError } = await supabase
          .from('service_records')
          .update(recordData)
          .eq('id', editRecord.id);

        if (recordError) throw recordError;
        recordId = editRecord.id;

        // Delete old items and insert new ones (simpler than syncing)
        const { error: deleteError } = await supabase
          .from('service_items')
          .delete()
          .eq('service_record_id', recordId);
          
        if (deleteError) throw deleteError;
      } else {
        // INSERT new record
        const { data: record, error: recordError } = await supabase
          .from('service_records')
          .insert(recordData)
          .select()
          .single();

        if (recordError) throw recordError;
        recordId = record.id;
      }

      const itemsToInsert = items
        .filter(item => item.description.trim())
        .map((item, index) => ({
          service_record_id: recordId,
          description: item.description,
          amount: Number(item.amount) || 0,
          date: item.date,
          kilometers: Number(item.kilometers) || 0,
          order_index: index
        }));

      if (itemsToInsert.length > 0) {
        const { error: itemsError } = await supabase
          .from('service_items')
          .insert(itemsToInsert);

        if (itemsError) throw itemsError;
      }

      if (!editRecord) {
        setClientName('');
        setPhone('');
        setDate(new Date().toISOString().split('T')[0]);
        setBrand('');
        setModel('');
        setPlate('');
        setKilometers('');
        setItems([{ description: '', amount: 0, date: new Date().toISOString().split('T')[0], order_index: 0, kilometers: 0 }]);
        setPayment('');
        setPaymentMethod('');
      }

      alert(editRecord ? 'Ficha actualizada exitosamente' : 'Ficha guardada exitosamente');
      onSaved?.();
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('Error al guardar la ficha');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4">
      <div className="bg-white rounded-xl shadow-xl p-8 border border-gray-200 min-h-[800px]">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8 pb-4 border-b">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              {editRecord ? 'Editar Ficha' : 'Nueva Ficha'}
            </h2>
            {editRecord && onCancel && (
              <button
                onClick={onCancel}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-all font-semibold"
              >
                <X size={20} />
                Cancelar
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1">
                  Nombre y Apellido
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:bg-white outline-none px-3 py-2 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1">
                  Teléfono
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:bg-white outline-none px-3 py-2 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1">
                  Fecha
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:bg-white outline-none px-3 py-2 transition-all"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1">
                  Marca
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="ej: FIAT, Volkswagen"
                  className="w-full bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:bg-white outline-none px-3 py-2 transition-all"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1">
                  Modelo
                </label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:bg-white outline-none px-3 py-2 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1">
                  Patente
                </label>
                <input
                  type="text"
                  value={plate}
                  onChange={(e) => setPlate(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:bg-white outline-none px-3 py-2 font-mono transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1">
                  Kilómetros
                </label>
                <input
                  type="number"
                  value={kilometers}
                  onChange={(e) => setKilometers(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:bg-white outline-none px-3 py-2 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">
                Repuestos / Mano de Obra
              </h3>
              <button
                onClick={addItem}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm font-semibold shadow-sm"
              >
                <Plus size={18} />
                Agregar Ítem
              </button>
            </div>

            <div className="space-y-6 bg-gray-50 p-4 rounded-xl border-2 border-dashed border-gray-200">
              {Object.entries(
                items.reduce((acc, item, index) => {
                  const key = item.date;
                  if (!acc[key]) acc[key] = [];
                  acc[key].push({ ...item, originalIndex: index });
                  return acc;
                }, {} as Record<string, (ServiceItem & { originalIndex: number })[]>
              ))
                .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
                .map(([date, dayItems]) => (
                  <div key={date} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <input
                          type="date"
                          value={date}
                          onChange={(e) => {
                            updateItemsForDate(date, 'date', e.target.value);
                          }}
                          className="bg-transparent border-none text-xs font-black text-gray-600 uppercase outline-none focus:ring-0"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Kilómetros:</span>
                        <input
                          type="number"
                          value={dayItems[0].kilometers || ''}
                          onChange={(e) => {
                            updateItemsForDate(date, 'kilometers', Number(e.target.value));
                          }}
                          placeholder="km"
                          className="w-24 bg-transparent border-b border-gray-300 text-xs font-bold text-gray-600 outline-none text-right px-1 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {dayItems.map((item) => (
                        <div key={item.originalIndex} className="flex gap-3 items-center px-4 py-3 group">
                          <div className="flex-1">
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => updateItem(item.originalIndex, 'description', e.target.value)}
                              placeholder="Descripción del trabajo o repuesto"
                              className="w-full bg-transparent outline-none py-1 text-gray-700"
                            />
                          </div>
                          {items.length > 1 && (
                            <button
                              onClick={() => removeItem(item.originalIndex)}
                              className="text-red-300 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="flex justify-end border-t pt-8">
            <div className="w-80 space-y-4">
              <div className="p-3 bg-gray-800 rounded-lg text-white space-y-2">
                <span className="font-bold block">TOTAL:</span>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-sm">$</span>
                  <input
                    type="number"
                    value={total}
                    onChange={(e) => setTotal(e.target.value)}
                    placeholder="0"
                    className="w-full bg-gray-900/40 border border-gray-600 rounded-lg outline-none pl-7 pr-3 py-2 text-right font-black text-2xl tracking-wide"
                  />
                </div>
              </div>

              <div className="p-4 bg-white border-2 border-gray-100 rounded-xl space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Entrega / Pago
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input
                      type="number"
                      value={payment}
                      onChange={(e) => setPayment(e.target.value)}
                      placeholder="0"
                      className="w-full bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:bg-white outline-none pl-7 pr-3 py-2 text-right font-bold text-green-600 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Método de Pago
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:bg-white outline-none px-3 py-2 transition-all font-semibold text-gray-700"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Transferencia">Transferencia</option>
                    <option value="Efectivo">Efectivo</option>
                    <option value="USD">USD</option>
                  </select>
                </div>

                {balance !== 0 && (
                  <div className="flex justify-between items-center p-3 bg-red-50 border border-red-100 rounded-lg">
                    <span className="font-bold text-red-600 uppercase text-xs">Saldo Pendiente:</span>
                    <span className="text-xl font-black text-red-600">$ {balance.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-12 pb-8">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-3 px-12 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-bold text-lg shadow-lg hover:shadow-xl active:transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={24} />
              {saving ? 'GUARDANDO...' : 'GUARDAR FICHA'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

}
