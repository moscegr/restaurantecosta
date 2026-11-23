import React, { useState, useEffect } from 'react';
import {
  Banknote,
  CreditCard,
  Send,
  CheckCircle,
  X,
  Delete,
  FileText,
  Percent,
} from 'lucide-react';
import type { InvoiceData, PaymentMethod } from '../../types';

interface QuickPayModalProps {
  subtotal: number;
  tableName?: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirmSale: (payload: {
    paymentMethod: PaymentMethod;
    amountPaid: number;
    tip: number;
    discount: number;
    invoiceData?: InvoiceData;
  }) => void;
}

export const QuickPayModal: React.FC<QuickPayModalProps> = ({
  subtotal,
  tableName,
  isOpen,
  onClose,
  onConfirmSale,
}) => {
  const [method, setMethod] = useState<PaymentMethod>('efectivo');
  const [tipPercent, setTipPercent] = useState<number>(0);
  const [amountPaidStr, setAmountPaidStr] = useState<string>(subtotal.toString());
  const [requireInvoice, setRequireInvoice] = useState(false);
  const [rfc, setRfc] = useState('');
  const [razonSocial, setRazonSocial] = useState('');
  const [usoCfdi, setUsoCfdi] = useState('G03 - Gastos en general');
  const [email, setEmail] = useState('');

  const tipAmount = Math.round(subtotal * (tipPercent / 100));
  const finalTotal = subtotal + tipAmount;

  useEffect(() => {
    if (isOpen) {
      setAmountPaidStr(finalTotal.toString());
    }
  }, [isOpen, finalTotal]);

  if (!isOpen) return null;

  const amountPaidNum = parseFloat(amountPaidStr) || 0;
  const change = Math.max(0, amountPaidNum - finalTotal);
  const isSufficient = method !== 'efectivo' || amountPaidNum >= finalTotal;

  const quickBills = [
    { label: `Exacto ($${finalTotal})`, value: finalTotal },
    { label: '$200', value: 200 },
    { label: '$500', value: 500 },
    { label: '$1,000', value: 1000 },
    { label: '$2,000', value: 2000 },
  ].filter((b, i) => i === 0 || b.value >= finalTotal);

  const handleNumpad = (num: string) => {
    if (amountPaidStr === finalTotal.toString() && num !== '0') {
      setAmountPaidStr(num);
      return;
    }
    setAmountPaidStr((prev) => (prev === '0' ? num : prev + num));
  };

  const handleBackspace = () => {
    setAmountPaidStr((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
  };

  const handleConfirm = () => {
    onConfirmSale({
      paymentMethod: method,
      amountPaid: method === 'efectivo' ? amountPaidNum : finalTotal,
      tip: tipAmount,
      discount: 0,
      invoiceData: requireInvoice
        ? { rfc: rfc.toUpperCase(), razonSocial, usoCfdi, email }
        : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="bg-[#0B3954] text-white px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-sky-200">
              Cobro Rápido {tableName ? `· ${tableName}` : ''}
            </p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-0.5">
              Total a Cobrar: ${finalTotal.toLocaleString('es-MX')} MXN
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white touch-press"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Columna Izquierda: Método, Propina y Factura */}
          <div className="md:col-span-7 space-y-4">
            {/* 1. Método de pago */}
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-2">
                1. Forma de Pago
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: 'efectivo', label: 'Efectivo', icon: Banknote },
                    { id: 'tarjeta', label: 'Tarjeta', icon: CreditCard },
                    { id: 'transferencia', label: 'SPEI', icon: Send },
                  ] as const
                ).map((item) => {
                  const Icon = item.icon;
                  const active = method === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setMethod(item.id);
                        setAmountPaidStr(finalTotal.toString());
                      }}
                      className={`py-3 px-2 rounded-xl border-2 flex flex-col items-center justify-center gap-1 font-bold text-xs touch-press ${
                        active
                          ? 'border-[#0B3954] bg-sky-50 text-[#0B3954]'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Propina Sugerida */}
            <div>
              <label className="text-xs font-bold text-slate-600 flex items-center gap-1 mb-2">
                <Percent className="w-3.5 h-3.5 text-[#087E8B]" />
                <span>2. Propina Sugerida (Opcional)</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[0, 10, 15, 20].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setTipPercent(pct)}
                    className={`py-2.5 rounded-xl border text-xs font-bold touch-press ${
                      tipPercent === pct
                        ? 'bg-amber-400 border-amber-500 text-slate-950'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {pct === 0 ? 'Sin propina' : `${pct}%`}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Billetes Rápidos */}
            {method === 'efectivo' && (
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-2">
                  3. Billetes Rápidos
                </label>
                <div className="flex flex-wrap gap-2">
                  {quickBills.map((bill) => (
                    <button
                      key={bill.label}
                      type="button"
                      onClick={() => setAmountPaidStr(bill.value.toString())}
                      className={`px-3.5 py-2.5 rounded-xl border text-xs font-extrabold touch-press ${
                        amountPaidNum === bill.value
                          ? 'bg-[#087E8B] text-white border-[#087E8B]'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {bill.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Solicitar Factura PDF */}
            <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <FileText className="w-4 h-4 text-[#0B3954]" />
                  <span>Capturar datos fiscales para Factura PDF</span>
                </span>
                <input
                  type="checkbox"
                  checked={requireInvoice}
                  onChange={(e) => setRequireInvoice(e.target.checked)}
                  className="w-4 h-4 accent-[#0B3954] rounded"
                />
              </label>

              {requireInvoice && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
                  <input
                    type="text"
                    placeholder="RFC Receptor (ej. XAXX010101000)"
                    value={rfc}
                    onChange={(e) => setRfc(e.target.value.toUpperCase())}
                    className="px-3 py-2 rounded-xl bg-white border border-slate-200 font-mono uppercase"
                  />
                  <input
                    type="text"
                    placeholder="Razón Social / Nombre"
                    value={razonSocial}
                    onChange={(e) => setRazonSocial(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-white border border-slate-200"
                  />
                  <select
                    value={usoCfdi}
                    onChange={(e) => setUsoCfdi(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-white border border-slate-200"
                  >
                    <option value="G03 - Gastos en general">G03 - Gastos en general</option>
                    <option value="S01 - Sin efectos fiscales">S01 - Sin efectos fiscales</option>
                    <option value="G01 - Adquisición de mercancías">G01 - Adquisición de mercancías</option>
                  </select>
                  <input
                    type="email"
                    placeholder="Correo electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-white border border-slate-200"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Columna Derecha: Monto Recibido, Cambio y Teclado Táctil */}
          <div className="md:col-span-5 flex flex-col justify-between space-y-3">
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-slate-100 rounded-2xl p-3 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 block">Recibido</span>
                <p className="text-xl font-extrabold text-slate-900 mt-0.5">
                  ${(method === 'efectivo' ? amountPaidNum : finalTotal).toLocaleString('es-MX')}
                </p>
              </div>
              <div className="bg-emerald-50 rounded-2xl p-3 border border-emerald-200">
                <span className="text-[11px] font-bold text-emerald-700 block">Cambio</span>
                <p className="text-xl font-extrabold text-emerald-800 mt-0.5">
                  ${(method === 'efectivo' ? change : 0).toLocaleString('es-MX')}
                </p>
              </div>
            </div>

            {method === 'efectivo' && (
              <div className="grid grid-cols-3 gap-2">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '00'].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleNumpad(num)}
                    className="h-12 rounded-xl bg-slate-50 hover:bg-slate-100 active:bg-[#0B3954] active:text-white border border-slate-200 text-base font-extrabold text-slate-800 touch-press"
                  >
                    {num}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleBackspace}
                  className="h-12 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 flex items-center justify-center touch-press"
                >
                  <Delete className="w-5 h-5" />
                </button>
              </div>
            )}

            {!isSufficient && (
              <p className="text-xs font-bold text-rose-700 bg-rose-50 p-2.5 rounded-xl text-center border border-rose-200">
                Faltan ${(finalTotal - amountPaidNum).toLocaleString('es-MX')} MXN para completar.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3.5 rounded-xl bg-white border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-100 touch-press"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={!isSufficient}
            onClick={handleConfirm}
            className={`flex-1 sm:flex-none sm:min-w-[260px] py-3.5 px-6 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-md touch-press ${
              isSufficient
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
          >
            <CheckCircle className="w-5 h-5" />
            <span>Confirmar Cobro · ${finalTotal.toLocaleString('es-MX')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
