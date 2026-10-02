import React, { useState } from 'react';
import { Banknote, CreditCard, Send, CheckCircle, X, Delete } from 'lucide-react';
import type { PaymentMethod } from '../../types';

interface QuickPayModalProps {
  total: number;
  isOpen: boolean;
  onClose: () => void;
  onConfirmSale: (method: PaymentMethod, amountPaid: number, change: number) => void;
}

export const QuickPayModal: React.FC<QuickPayModalProps> = ({
  total,
  isOpen,
  onClose,
  onConfirmSale,
}) => {
  const [method, setMethod] = useState<PaymentMethod>('efectivo');
  const [amountPaidStr, setAmountPaidStr] = useState<string>(total.toString());

  if (!isOpen) return null;

  const amountPaidNum = parseFloat(amountPaidStr) || 0;
  const change = Math.max(0, amountPaidNum - total);
  const isExactOrSufficient = method !== 'efectivo' || amountPaidNum >= total;

  // Billetes sugeridos comunes en México
  const quickBills = [
    { label: `Exacto ($${total})`, value: total },
    { label: '$100', value: 100 },
    { label: '$200', value: 200 },
    { label: '$500', value: 500 },
    { label: '$1,000', value: 1000 },
  ].filter(b => b.value >= total || b.value === total);

  // Si ninguno califica (ej. total > 1000), dar billetes altos
  const displayBills = quickBills.length > 0 ? quickBills : [
    { label: `Exacto ($${total})`, value: total },
    { label: '$1,000', value: 1000 },
    { label: '$2,000', value: 2000 },
  ];

  const handleSelectBill = (val: number) => {
    setAmountPaidStr(val.toString());
  };

  const handleNumpad = (num: string) => {
    if (amountPaidStr === total.toString() && num !== '0') {
      setAmountPaidStr(num);
      return;
    }
    setAmountPaidStr(prev => prev + num);
  };

  const handleBackspace = () => {
    setAmountPaidStr(prev => (prev.length > 1 ? prev.slice(0, -1) : '0'));
  };

  const handleConfirm = () => {
    const finalPaid = method === 'efectivo' ? amountPaidNum : total;
    const finalChange = method === 'efectivo' ? change : 0;
    onConfirmSale(method, finalPaid, finalChange);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-700 to-cyan-800 text-white p-4 sm:p-5 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-extrabold text-teal-200 tracking-wider">
              Cobro Rápido · 3 Toques
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-amber-300">
              Total: ${total.toLocaleString('es-MX')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {/* 1. Selector de Método de Pago */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              1. Forma de Pago
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setMethod('efectivo');
                  setAmountPaidStr(total.toString());
                }}
                className={`py-3 px-2 rounded-xl border-2 flex flex-col items-center justify-center gap-1 font-bold text-xs sm:text-sm transition-all touch-press ${
                  method === 'efectivo'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Banknote className="w-5 h-5 text-emerald-600" />
                <span>Efectivo</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMethod('tarjeta');
                  setAmountPaidStr(total.toString());
                }}
                className={`py-3 px-2 rounded-xl border-2 flex flex-col items-center justify-center gap-1 font-bold text-xs sm:text-sm transition-all touch-press ${
                  method === 'tarjeta'
                    ? 'border-cyan-600 bg-cyan-50 text-cyan-900 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CreditCard className="w-5 h-5 text-cyan-600" />
                <span>Tarjeta</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMethod('transferencia');
                  setAmountPaidStr(total.toString());
                }}
                className={`py-3 px-2 rounded-xl border-2 flex flex-col items-center justify-center gap-1 font-bold text-xs sm:text-sm transition-all touch-press ${
                  method === 'transferencia'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Send className="w-5 h-5 text-indigo-600" />
                <span>Transferencia</span>
              </button>
            </div>
          </div>

          {/* 2. Denominaciones Rápidas (Para Efectivo) */}
          {method === 'efectivo' && (
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                2. ¿Con cuánto pagan? (Billetes rápidos)
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {displayBills.map((bill) => (
                  <button
                    key={bill.label}
                    type="button"
                    onClick={() => handleSelectBill(bill.value)}
                    className={`py-3 px-3 rounded-xl border font-black text-sm transition-all touch-press ${
                      amountPaidNum === bill.value
                        ? 'bg-amber-400 text-cyan-950 border-amber-500 shadow-md scale-102'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {bill.label}
                  </button>
                ))}
              </div>

              {/* Pantalla de Recibido y Cambio */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-slate-100 rounded-2xl p-3 border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block">
                    Recibido:
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-slate-400 font-bold">$</span>
                    <input
                      type="number"
                      value={amountPaidStr}
                      onChange={(e) => setAmountPaidStr(e.target.value)}
                      className="w-full text-xl sm:text-2xl font-black text-slate-900 bg-transparent focus:outline-none"
                    />
                  </div>
                </div>

                <div className="bg-emerald-50 rounded-2xl p-3 border border-emerald-200">
                  <span className="text-[11px] font-bold text-emerald-700 uppercase block">
                    Cambio a entregar:
                  </span>
                  <p className="text-xl sm:text-2xl font-black text-emerald-800 mt-0.5">
                    ${change.toLocaleString('es-MX')}
                  </p>
                </div>
              </div>

              {/* Teclado Táctil Integrado para Tablets */}
              <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 text-center">
                  Teclado Numérico Táctil
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleNumpad(num)}
                      className="py-2.5 rounded-xl bg-white border border-slate-200 font-bold text-base text-slate-800 hover:bg-slate-100 active:bg-cyan-100 touch-press shadow-xs"
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleNumpad('0')}
                    className="py-2.5 rounded-xl bg-white border border-slate-200 font-bold text-base text-slate-800 hover:bg-slate-100 active:bg-cyan-100 touch-press shadow-xs"
                  >
                    0
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNumpad('00')}
                    className="py-2.5 rounded-xl bg-white border border-slate-200 font-bold text-base text-slate-800 hover:bg-slate-100 active:bg-cyan-100 touch-press shadow-xs"
                  >
                    00
                  </button>
                  <button
                    type="button"
                    onClick={handleBackspace}
                    className="py-2.5 rounded-xl bg-rose-50 border border-rose-200 font-bold text-sm text-rose-700 hover:bg-rose-100 active:bg-rose-200 flex items-center justify-center touch-press shadow-xs"
                    title="Borrar dígito"
                  >
                    <Delete className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {amountPaidNum < total && (
                <p className="text-xs font-bold text-rose-600 bg-rose-50 p-2 rounded-lg text-center">
                  ⚠️ Falta dinero: Faltan ${(total - amountPaidNum).toLocaleString('es-MX')} para completar el total.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer: Botón Gigante de Cobro */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200">
          <button
            type="button"
            disabled={!isExactOrSufficient}
            onClick={handleConfirm}
            className={`w-full py-4 rounded-2xl font-black text-base sm:text-lg flex items-center justify-center gap-2 shadow-xl transition-all touch-press ${
              isExactOrSufficient
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white cursor-pointer active:scale-98'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
          >
            <CheckCircle className="w-6 h-6 text-white" />
            <span>Cobrar ${total.toLocaleString('es-MX')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
