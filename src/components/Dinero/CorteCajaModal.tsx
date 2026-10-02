import React, { useState } from 'react';
import { X, Calculator, Printer, Banknote, CreditCard, Send } from 'lucide-react';
import type { Transaction, BusinessConfig } from '../../types';

interface CorteCajaModalProps {
  transactions: Transaction[];
  dateStr: string;
  config: BusinessConfig | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CorteCajaModal: React.FC<CorteCajaModalProps> = ({
  transactions,
  dateStr,
  config,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const [efectivoContado, setEfectivoContado] = useState<string>('');

  const ingresosEfectivo = transactions
    .filter(t => t.type === 'ingreso' && t.paymentMethod === 'efectivo')
    .reduce((sum, t) => sum + t.amount, 0);

  const egresosEfectivo = transactions
    .filter(t => t.type === 'egreso' && t.paymentMethod === 'efectivo')
    .reduce((sum, t) => sum + t.amount, 0);

  const efectivoEsperadoEnCaja = ingresosEfectivo - egresosEfectivo;

  const ingresosTarjeta = transactions
    .filter(t => t.type === 'ingreso' && t.paymentMethod === 'tarjeta')
    .reduce((sum, t) => sum + t.amount, 0);

  const ingresosTransferencia = transactions
    .filter(t => t.type === 'ingreso' && t.paymentMethod === 'transferencia')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalVentas = transactions
    .filter(t => t.type === 'ingreso')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalGastos = transactions
    .filter(t => t.type === 'egreso')
    .reduce((sum, t) => sum + t.amount, 0);

  const utilidadNeta = totalVentas - totalGastos;

  const contadoNum = parseFloat(efectivoContado) || 0;
  const diferenciaEfectivo = efectivoContado ? contadoNum - efectivoEsperadoEnCaja : 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-900 to-teal-800 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="w-6 h-6 text-amber-300" />
            <div>
              <h3 className="text-lg font-black leading-tight">
                Corte de Caja Diario (Corte Z)
              </h3>
              <p className="text-xs text-teal-200">
                {config?.businessName || 'Ramada & Posada'} · {dateStr}
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

        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 font-sans">
          {/* Resumen General */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5">
              <span className="text-[10px] uppercase font-bold text-emerald-700 block">Total Entradas</span>
              <span className="text-base font-black text-emerald-800">${totalVentas.toLocaleString('es-MX')}</span>
            </div>
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-2.5">
              <span className="text-[10px] uppercase font-bold text-rose-700 block">Total Gastos</span>
              <span className="text-base font-black text-rose-800">${totalGastos.toLocaleString('es-MX')}</span>
            </div>
            <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-2.5">
              <span className="text-[10px] uppercase font-bold text-cyan-800 block">Utilidad Neta</span>
              <span className="text-base font-black text-cyan-900">${utilidadNeta.toLocaleString('es-MX')}</span>
            </div>
          </div>

          {/* Arqueo de Efectivo Físico */}
          <div className="bg-amber-50/70 border-2 border-amber-300/80 rounded-2xl p-4 space-y-3">
            <h4 className="font-extrabold text-sm text-amber-950 flex items-center gap-1.5">
              <Banknote className="w-4 h-4 text-emerald-600" />
              <span>Arqueo de Efectivo Físico en Gaveta</span>
            </h4>

            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-slate-700">
                <span>(+) Ventas cobradas en efectivo:</span>
                <span className="font-bold">${ingresosEfectivo.toLocaleString('es-MX')}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>(-) Gastos pagados en efectivo:</span>
                <span className="font-bold text-rose-600">-${egresosEfectivo.toLocaleString('es-MX')}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-slate-900 pt-1 border-t border-amber-200">
                <span>(=) Efectivo que debe haber en caja:</span>
                <span className="text-cyan-900">${efectivoEsperadoEnCaja.toLocaleString('es-MX')}</span>
              </div>
            </div>

            {/* Input de conteo físico */}
            <div className="pt-2">
              <label className="text-xs font-bold text-amber-900 block mb-1">
                ¿Cuánto dinero físico contaste en la mano/caja? ($ MXN)
              </label>
              <input
                type="number"
                placeholder="Ingresa lo que tienes en billetes y monedas"
                value={efectivoContado}
                onChange={(e) => setEfectivoContado(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-amber-300 rounded-xl text-lg font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {efectivoContado !== '' && (
              <div
                className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between ${
                  diferenciaEfectivo === 0
                    ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                    : diferenciaEfectivo > 0
                    ? 'bg-blue-100 border-blue-300 text-blue-900'
                    : 'bg-rose-100 border-rose-300 text-rose-900'
                }`}
              >
                <span>
                  {diferenciaEfectivo === 0
                    ? '✅ ¡Caja Cuadrada Exacta!'
                    : diferenciaEfectivo > 0
                    ? '🔵 Sobrante de Efectivo:'
                    : '⚠️ Faltante de Efectivo:'}
                </span>
                <span className="text-sm font-black">
                  {diferenciaEfectivo >= 0 ? '+' : ''}${diferenciaEfectivo.toLocaleString('es-MX')}
                </span>
              </div>
            )}
          </div>

          {/* Desglose de Pagos Digitales (Bancos / Terminal) */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2 text-xs">
            <span className="font-extrabold text-slate-700 block">
              Cobros Electrónicos del Día
            </span>
            <div className="flex justify-between">
              <span className="flex items-center gap-1.5 text-slate-600">
                <CreditCard className="w-3.5 h-3.5 text-cyan-600" /> Tarjetas (Terminal bancaria / Clip):
              </span>
              <span className="font-bold text-slate-800">${ingresosTarjeta.toLocaleString('es-MX')}</span>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center gap-1.5 text-slate-600">
                <Send className="w-3.5 h-3.5 text-indigo-600" /> Transferencias (SPEI / BBVA / Banco Azteca):
              </span>
              <span className="font-bold text-slate-800">${ingresosTransferencia.toLocaleString('es-MX')}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex gap-2">
          <button
            onClick={() => window.print()}
            className="flex-1 py-3 bg-white hover:bg-slate-100 border border-slate-300 font-bold text-xs sm:text-sm text-slate-700 rounded-xl flex items-center justify-center gap-1.5 shadow-sm touch-press"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Corte</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-cyan-800 hover:bg-cyan-900 text-white font-black text-xs sm:text-sm rounded-xl shadow-md touch-press"
          >
            Aceptar y Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
