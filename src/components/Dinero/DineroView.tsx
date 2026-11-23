import React, { useState, useEffect } from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  PlusCircle,
  Calculator,
  Search,
  FileSpreadsheet,
  FileDown,
  Printer,
  Receipt,
} from 'lucide-react';
import type { BusinessConfig, Order, Transaction } from '../../types';
import { api } from '../../services/api';
import { exportTransactionsToCSV } from '../../services/exportService';
import { generateInvoicePDF, printThermalTicket } from '../../services/pdfService';
import { QuickExpenseModal } from './QuickExpenseModal';
import { CorteCajaModal } from './CorteCajaModal';

interface DineroViewProps {
  config: BusinessConfig | null;
}

export const DineroView: React.FC<DineroViewProps> = ({ config }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [paidOrders, setPaidOrders] = useState<Order[]>([]);
  const [todayStr] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [activeSubTab, setActiveSubTab] = useState<'movimientos' | 'facturas'>('movimientos');
  const [filterType, setFilterType] = useState<'todos' | 'ingreso' | 'egreso'>('todos');
  const [searchQuery, setSearchQuery] = useState('');

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isCorteModalOpen, setIsCorteModalOpen] = useState(false);

  const loadData = async () => {
    try {
      const [txList, ordList] = await Promise.all([
        api.getTransactions(),
        api.getOrders({ status: 'cobrado', dateString: selectedDate }),
      ]);
      setTransactions(txList);
      setPaidOrders(ordList);
    } catch (err) {
      console.error('Error cargando finanzas:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const dateTransactions = transactions.filter((t) => t.dateString === selectedDate);

  const totalIngresos = dateTransactions
    .filter((t) => t.type === 'ingreso')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalEgresos = dateTransactions
    .filter((t) => t.type === 'egreso')
    .reduce((sum, t) => sum + t.amount, 0);

  const utilidadNeta = totalIngresos - totalEgresos;

  const displayedTransactions = dateTransactions.filter((t) => {
    const matchType = filterType === 'todos' || t.type === filterType;
    const matchSearch =
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-6xl mx-auto w-full space-y-5 pb-16">
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">
              Finanzas, Facturación PDF y Control RESICO
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Ingresos, egresos diarios, corte Z y exportación contable lista para SAT.
            </p>
          </div>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800"
          />
        </div>

        {/* Resumen del Día */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
              <ArrowUpRight className="w-4 h-4 text-emerald-600" />
              <span>Ingresos del Día</span>
            </div>
            <p className="text-2xl font-extrabold text-emerald-800 mt-1">
              ${totalIngresos.toLocaleString('es-MX')}
            </p>
          </div>

          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4">
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800">
              <ArrowDownRight className="w-4 h-4 text-rose-600" />
              <span>Egresos del Día</span>
            </div>
            <p className="text-2xl font-extrabold text-rose-800 mt-1">
              ${totalEgresos.toLocaleString('es-MX')}
            </p>
          </div>

          <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#0B3954]">
              <Wallet className="w-4 h-4 text-[#087E8B]" />
              <span>Utilidad Neta</span>
            </div>
            <p
              className={`text-2xl font-extrabold mt-1 ${
                utilidadNeta >= 0 ? 'text-[#0B3954]' : 'text-rose-700'
              }`}
            >
              ${utilidadNeta.toLocaleString('es-MX')}
            </p>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() => setIsExpenseModalOpen(true)}
            className="py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 touch-press shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Registrar Gasto / Salida</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCorteModalOpen(true)}
            className="py-3 px-4 bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 touch-press shadow-xs"
          >
            <Calculator className="w-4 h-4" />
            <span>Arqueo y Corte de Caja (Z)</span>
          </button>

          <button
            type="button"
            onClick={() => exportTransactionsToCSV(transactions)}
            className="py-3 px-4 bg-[#0B3954] hover:bg-[#082C42] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 touch-press shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-amber-400" />
            <span>Exportar CSV Contador (RESICO)</span>
          </button>
        </div>
      </div>

      {/* Selector de Subvista: Movimientos vs Facturas y Tickets */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveSubTab('movimientos')}
              className={`px-4 py-2 rounded-xl text-xs font-bold touch-press ${
                activeSubTab === 'movimientos'
                  ? 'bg-[#0B3954] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Flujo de Caja ({displayedTransactions.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('facturas')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 touch-press ${
                activeSubTab === 'facturas'
                  ? 'bg-[#0B3954] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Ventas, Facturas PDF y Tickets ({paidOrders.length})</span>
            </button>
          </div>

          {activeSubTab === 'movimientos' && (
            <div className="flex items-center gap-1.5">
              {(['todos', 'ingreso', 'egreso'] as const).map((tp) => (
                <button
                  key={tp}
                  type="button"
                  onClick={() => setFilterType(tp)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize ${
                    filterType === tp ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tp}
                </button>
              ))}
            </div>
          )}
        </div>

        {activeSubTab === 'movimientos' ? (
          <>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por concepto o categoría..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm"
              />
            </div>

            <div className="divide-y divide-slate-100">
              {displayedTransactions.length === 0 ? (
                <p className="py-8 text-center text-xs text-slate-400">
                  Sin movimientos registrados para {selectedDate}.
                </p>
              ) : (
                displayedTransactions.map((t) => {
                  const isIncome = t.type === 'ingreso';
                  const time = new Date(t.date).toLocaleTimeString('es-MX', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div key={t.id} className="py-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isIncome
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {isIncome ? (
                            <ArrowUpRight className="w-4 h-4" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h5 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                            {t.description}
                          </h5>
                          <p className="text-[11px] text-slate-500">
                            {t.category} · {time} · {t.paymentMethod.toUpperCase()}
                            {t.userName ? ` · ${t.userName}` : ''}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`text-sm font-extrabold shrink-0 ${
                          isIncome ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {isIncome ? '+' : '-'}${t.amount.toLocaleString('es-MX')}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </>
        ) : (
          <div className="divide-y divide-slate-100">
            {paidOrders.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-400">
                No hay ventas cobradas para {selectedDate}.
              </p>
            ) : (
              paidOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-extrabold text-[#0B3954] bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                        {ord.folio}
                      </span>
                      <span className="font-bold text-sm text-slate-900">{ord.tableOrRamada}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {ord.items.length} productos · Pago:{' '}
                      <span className="uppercase font-semibold">{ord.paymentMethod}</span> · Atendió:{' '}
                      {ord.waiterName}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-base font-extrabold text-slate-900 mr-2">
                      ${ord.total.toLocaleString('es-MX')}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        printThermalTicket(ord, config, 'cliente', config?.thermalPaperWidth || '80mm')
                      }
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 touch-press"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Ticket</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => generateInvoicePDF(ord, config)}
                      className="px-3 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 touch-press"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      <span>Factura PDF</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <QuickExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSuccess={loadData}
      />

      <CorteCajaModal
        transactions={dateTransactions}
        dateStr={selectedDate}
        config={config}
        isOpen={isCorteModalOpen}
        onClose={() => setIsCorteModalOpen(false)}
      />
    </div>
  );
};
