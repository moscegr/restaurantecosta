import React, { useState } from 'react';
import { X, MinusCircle, Check } from 'lucide-react';
import type { ExpenseCategory, PaymentMethod } from '../../types';
import { api } from '../../services/api';

interface QuickExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Pescado y Marisco Fresco',
  'Hielo y Bebidas',
  'Carbón y Leña',
  'Gas',
  'Abarrotes y Verduras',
  'Mantenimiento e Higiene',
  'Nómina / Propinas',
  'Otro',
];

export const QuickExpenseModal: React.FC<QuickExpenseModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [category, setCategory] = useState<ExpenseCategory>('Hielo y Bebidas');
  const [amountStr, setAmountStr] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const amountNum = parseFloat(amountStr) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amountNum <= 0) return;

    try {
      setSaving(true);
      await api.createTransaction({
        type: 'egreso',
        category,
        amount: amountNum,
        description: description.trim() || `Gasto en ${category}`,
        paymentMethod,
      });
      setAmountStr('');
      setDescription('');
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Error registrando gasto.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200">
        <div className="bg-rose-700 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <MinusCircle className="w-6 h-6 text-rose-200" />
            <div>
              <h3 className="text-base font-extrabold">Registrar Gasto / Salida de Caja</h3>
              <p className="text-xs text-rose-100">Se refleja en tiempo real en RESICO y Corte Z</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs sm:text-sm">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Monto del Gasto ($ MXN) *</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-2xl font-extrabold text-rose-600">
                $
              </span>
              <input
                type="number"
                step="any"
                required
                placeholder="0.00"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                className="w-full pl-9 pr-4 py-3 bg-rose-50/50 border border-rose-200 rounded-xl text-2xl font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1.5">Categoría</label>
            <div className="grid grid-cols-2 gap-2">
              {EXPENSE_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-left touch-press ${
                    category === cat
                      ? 'bg-rose-100 border-rose-400 text-rose-950'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Concepto / Detalle</label>
            <input
              type="text"
              placeholder="Ej. Compra de 5 bolsas de hielo"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Pagado con:</label>
            <div className="grid grid-cols-3 gap-2">
              {(['efectivo', 'tarjeta', 'transferencia'] as PaymentMethod[]).map((pm) => (
                <button
                  key={pm}
                  type="button"
                  onClick={() => setPaymentMethod(pm)}
                  className={`py-2 rounded-xl border text-xs font-bold uppercase touch-press ${
                    paymentMethod === pm
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  {pm}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 rounded-xl text-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 touch-press"
            >
              <Check className="w-4 h-4" />
              <span>{saving ? 'Guardando...' : 'Guardar Gasto'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
