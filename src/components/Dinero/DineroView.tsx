import React, { useState, useEffect } from 'react';
import { 
  Wallet, ArrowUpRight, ArrowDownRight, PlusCircle, 
  Calculator, Search, FileSpreadsheet 
} from 'lucide-react';
import type { Transaction, BusinessConfig } from '../../types';
import { db } from '../../db/db';
import { exportTransactionsToCSV } from '../../services/exportService';
import { QuickExpenseModal } from './QuickExpenseModal';
import { CorteCajaModal } from './CorteCajaModal';

interface DineroViewProps {
  config: BusinessConfig | null;
}

export const DineroView: React.FC<DineroViewProps> = ({ config }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [todayStr] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [filterType, setFilterType] = useState<'todos' | 'ingreso' | 'egreso'>('todos');
  const [searchQuery, setSearchQuery] = useState('');

  // Modales
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isCorteModalOpen, setIsCorteModalOpen] = useState(false);

  const loadTransactions = async () => {
    const list = await db.transactions.toArray();
    setTransactions(list);
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  // Transacciones de la fecha seleccionada
  const dateTransactions = transactions.filter(t => t.dateString === selectedDate);

  const totalIngresos = dateTransactions
    .filter(t => t.type === 'ingreso')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalEgresos = dateTransactions
    .filter(t => t.type === 'egreso')
    .reduce((sum, t) => sum + t.amount, 0);

  const utilidadNeta = totalIngresos - totalEgresos;

  // Filtrado para la tabla
  const displayedTransactions = dateTransactions.filter(t => {
    const matchType = filterType === 'todos' || t.type === filterType;
    const matchSearch = 
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchSearch;
  });

  const handleExportCSV = () => {
    exportTransactionsToCSV(transactions);
  };

  return (
    <div className="flex-1 overflow-y-auto pb-24 p-3 sm:p-5 max-w-5xl mx-auto space-y-4">
      {/* Cabecera y Resumen Financiero del Día */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
              Control de Dinero & Caja (RESICO)
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Ingresos, egresos diarios y reportes listos para tu contador
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-600"
            />
          </div>
        </div>

        {/* 3 Tarjetas de Resumen Financiero */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3 sm:p-4">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
              <ArrowUpRight className="w-4 h-4 text-emerald-600" />
              <span>Ingresos</span>
            </div>
            <p className="text-xl sm:text-2xl font-black text-emerald-700 mt-1">
              ${totalIngresos.toLocaleString('es-MX')}
            </p>
          </div>

          <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-3 sm:p-4">
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800">
              <ArrowDownRight className="w-4 h-4 text-rose-600" />
              <span>Egresos</span>
            </div>
            <p className="text-xl sm:text-2xl font-black text-rose-700 mt-1">
              ${totalEgresos.toLocaleString('es-MX')}
            </p>
          </div>

          <div className="bg-cyan-50/70 border border-cyan-200 rounded-2xl p-3 sm:p-4">
            <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-900">
              <Wallet className="w-4 h-4 text-cyan-700" />
              <span>Utilidad Neta</span>
            </div>
            <p className={`text-xl sm:text-2xl font-black mt-1 ${utilidadNeta >= 0 ? 'text-cyan-950' : 'text-rose-600'}`}>
              ${utilidadNeta.toLocaleString('es-MX')}
            </p>
          </div>
        </div>

        {/* Botones de Acción: Gasto Rápido, Corte de Caja, CSV para Contador */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="py-3 px-4 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-extrabold rounded-xl text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 touch-press"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Registrar Gasto / Salida</span>
          </button>

          <button
            onClick={() => setIsCorteModalOpen(true)}
            className="py-3 px-4 bg-amber-500 hover:bg-amber-600 text-cyan-950 font-black rounded-xl text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 touch-press"
          >
            <Calculator className="w-4 h-4" />
            <span>Corte de Caja Diario</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-xl text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 touch-press"
            title="Descarga archivo CSV compatible con Excel para tus declaraciones SAT"
          >
            <FileSpreadsheet className="w-4 h-4 text-amber-300" />
            <span>CSV para el Contador</span>
          </button>
        </div>
      </div>

      {/* Historial de Movimientos de la Fecha */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
            Movimientos ({displayedTransactions.length}) · {selectedDate}
          </h3>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFilterType('todos')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                filterType === 'todos' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterType('ingreso')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                filterType === 'ingreso' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-800'
              }`}
            >
              Ingresos
            </button>
            <button
              onClick={() => setFilterType('egreso')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                filterType === 'egreso' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-800'
              }`}
            >
              Egresos
            </button>
          </div>
        </div>

        {/* Buscador de movimientos */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por concepto o categoría (hielo, marisco, comanda...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-600"
          />
        </div>

        {/* Lista de movimientos */}
        <div className="divide-y divide-slate-100">
          {displayedTransactions.length === 0 ? (
            <p className="py-8 text-center text-xs text-slate-400">
              No hay movimientos registrados para esta fecha o filtro.
            </p>
          ) : (
            displayedTransactions.slice().reverse().map((t) => {
              const isIncome = t.type === 'ingreso';
              const time = new Date(t.date).toLocaleTimeString('es-MX', {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div key={t.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm shrink-0 ${
                        isIncome ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {isIncome ? '↓' : '↑'}
                    </div>
                    <div>
                      <h5 className="font-bold text-xs sm:text-sm text-slate-900 leading-snug">
                        {t.description}
                      </h5>
                      <p className="text-[11px] text-slate-400">
                        {t.category} · {time} · {t.paymentMethod.toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-sm sm:text-base font-black shrink-0 ${
                      isIncome ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {isIncome ? '+' : '-'}${t.amount.toLocaleString('es-MX')}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal de Gasto Rápido */}
      <QuickExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSuccess={loadTransactions}
      />

      {/* Modal de Corte de Caja */}
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
