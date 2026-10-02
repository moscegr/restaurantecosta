import React, { useState } from 'react';
import { X, MinusCircle, Check } from 'lucide-react';
import type { ExpenseCategory, PaymentMethod } from '../../types';
import { db } from '../../db/db';

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
  if (!isOpen) return null;

  const [category, setCategory] = useState<ExpenseCategory>('Hielo y Bebidas');
  const [amountStr, setAmountStr] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo');

  const amountNum = parseFloat(amountStr) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amountNum <= 0) {
      alert('Ingresa un monto válido.');
      return;
    }

    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const nowIso = new Date().toISOString();

      await db.transactions.add({
        date: nowIso,
        dateString: todayStr,
        type: 'egreso',
        category,
        amount: amountNum,
        description: description.trim() || `Gasto en ${category}`,
        paymentMethod,
      });

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error registrando gasto:', err);
      alert('Hubo un error al registrar el gasto.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-700 to-rose-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MinusCircle className="w-6 h-6 text-rose-300" />
            <div>
              <h3 className="text-lg font-black leading-tight">
                Registrar Gasto Rápido
              </h3>
              <p className="text-xs text-rose-200">
                Afecta tu caja del día y el reporte del contador (RESICO)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {/* Monto */}
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">
              Monto del Gasto ($ MXN) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-2xl font-black text-rose-600">$</span>
              <input
                type="number"
                step="any"
                required
                placeholder="0.00"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                className="w-full pl-9 pr-4 py-3 bg-rose-50/50 border border-rose-200 rounded-xl text-2xl font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                autoFocus
              />
            </div>
          </div>

          {/* Categoría */}
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1.5">
              Categoría del Gasto *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {EXPENSE_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all touch-press ${
                    category === cat
                      ? 'bg-rose-100 border-rose-400 text-rose-950 font-black shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">
              Concepto / Detalle
            </label>
            <input
              type="text"
              placeholder="Ej. 3 bolsas de hielo para la hielera principal"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Método de Pago con que se liquidó */}
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">
              Pagado con:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['efectivo', 'tarjeta', 'transferencia'] as PaymentMethod[]).map((pm) => (
                <button
                  key={pm}
                  type="button"
                  onClick={() => setPaymentMethod(pm)}
                  className={`py-2 px-2 rounded-xl border text-xs font-bold uppercase transition-all ${
                    paymentMethod === pm
                      ? 'bg-slate-800 text-white border-slate-900'
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  {pm}
                </button>
              ))}
            </div>
          </div>

          {/* Botones */}
          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-200 hover:bg-slate-300 font-bold text-xs sm:text-sm text-slate-700 rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-black text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-1.5 touch-press"
            >
              <Check className="w-4 h-4" />
              <span>Guardar Gasto</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
