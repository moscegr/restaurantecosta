import React, { useState } from 'react';
import {
  X,
  Calculator,
  Printer,
  Banknote,
  CreditCard,
  Send,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
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
  const [efectivoContado, setEfectivoContado] = useState<string>('');

  if (!isOpen) return null;

  const ingresosEfectivo = transactions
    .filter((t) => t.type === 'ingreso' && t.paymentMethod === 'efectivo')
    .reduce((sum, t) => sum + t.amount, 0);

  const egresosEfectivo = transactions
    .filter((t) => t.type === 'egreso' && t.paymentMethod === 'efectivo')
    .reduce((sum, t) => sum + t.amount, 0);

  const efectivoEsperado = ingresosEfectivo - egresosEfectivo;

  const ingresosTarjeta = transactions
    .filter((t) => t.type === 'ingreso' && t.paymentMethod === 'tarjeta')
    .reduce((sum, t) => sum + t.amount, 0);

  const ingresosTransferencia = transactions
    .filter((t) => t.type === 'ingreso' && t.paymentMethod === 'transferencia')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalVentas = transactions
    .filter((t) => t.type === 'ingreso')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalGastos = transactions
    .filter((t) => t.type === 'egreso')
    .reduce((sum, t) => sum + t.amount, 0);

  const utilidadNeta = totalVentas - totalGastos;
  const contadoNum = parseFloat(efectivoContado) || 0;
  const diferencia = efectivoContado ? contadoNum - efectivoEsperado : 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-3">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200">
        <div className="bg-[#0B3954] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Calculator className="w-6 h-6 text-amber-400" />
            <div>
              <h3 className="text-base font-extrabold">Corte de Caja Diario (Corte Z)</h3>
              <p className="text-xs text-sky-200">
                {config?.businessName || 'Ramada & Posada'} · {dateStr}
              </p>
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

        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
              <span className="text-[10px] uppercase font-bold text-emerald-700 block">Entradas</span>
              <span className="text-base font-extrabold text-emerald-800">
                ${totalVentas.toLocaleString('es-MX')}
              </span>
            </div>
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3">
              <span className="text-[10px] uppercase font-bold text-rose-700 block">Salidas</span>
              <span className="text-base font-extrabold text-rose-800">
                ${totalGastos.toLocaleString('es-MX')}
              </span>
            </div>
            <div className="bg-sky-50 border border-sky-200 rounded-xl p-3">
              <span className="text-[10px] uppercase font-bold text-[#0B3954] block">Utilidad</span>
              <span className="text-base font-extrabold text-[#0B3954]">
                ${utilidadNeta.toLocaleString('es-MX')}
              </span>
            </div>
          </div>

          <div className="bg-[#FAF8F5] border border-amber-200 rounded-2xl p-4 space-y-3">
            <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
              <Banknote className="w-4 h-4 text-emerald-600" />
              <span>Arqueo de Efectivo Físico</span>
            </h4>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Ventas cobradas en efectivo:</span>
                <span className="font-bold text-slate-900">${ingresosEfectivo.toLocaleString('es-MX')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Gastos pagados en efectivo:</span>
                <span className="font-bold text-rose-600">-${egresosEfectivo.toLocaleString('es-MX')}</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-amber-200">
                <span>Efectivo esperado en gaveta:</span>
                <span className="text-[#0B3954]">${efectivoEsperado.toLocaleString('es-MX')}</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Efectivo contado físicamente ($ MXN)
              </label>
              <input
                type="number"
                placeholder="Ingresa el total de billetes y monedas"
                value={efectivoContado}
                onChange={(e) => setEfectivoContado(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-lg font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#087E8B]"
              />
            </div>

            {efectivoContado !== '' && (
              <div
                className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between ${
                  diferencia === 0
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : diferencia > 0
                    ? 'bg-sky-50 border-sky-300 text-sky-900'
                    : 'bg-rose-50 border-rose-300 text-rose-900'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  {diferencia === 0 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                  )}
                  {diferencia === 0
                    ? 'Caja Cuadrada Exacta'
                    : diferencia > 0
                    ? 'Sobrante de Efectivo'
                    : 'Faltante de Efectivo'}
                </span>
                <span className="text-sm font-extrabold">
                  {diferencia >= 0 ? '+' : ''}${diferencia.toLocaleString('es-MX')}
                </span>
              </div>
            )}
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2 text-xs">
            <span className="font-extrabold text-slate-800 block">Cobros Electrónicos del Día</span>
            <div className="flex justify-between">
              <span className="flex items-center gap-1.5 text-slate-600">
                <CreditCard className="w-3.5 h-3.5 text-[#087E8B]" /> Terminal Bancaria / Tarjeta:
              </span>
              <span className="font-bold text-slate-900">${ingresosTarjeta.toLocaleString('es-MX')}</span>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center gap-1.5 text-slate-600">
                <Send className="w-3.5 h-3.5 text-indigo-600" /> Transferencias SPEI:
              </span>
              <span className="font-bold text-slate-900">${ingresosTransferencia.toLocaleString('es-MX')}</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex-1 py-3 bg-white hover:bg-slate-100 border border-slate-300 font-bold text-xs text-slate-700 rounded-xl flex items-center justify-center gap-1.5 touch-press"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Corte</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 bg-[#0B3954] hover:bg-[#082C42] text-white font-extrabold text-xs rounded-xl touch-press"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
