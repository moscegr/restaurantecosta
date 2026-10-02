import React, { useState, useEffect } from 'react';
import { 
  Sparkles, BedDouble, 
  ArrowUpRight, ArrowDownRight, ShoppingCart, PlusCircle, 
  Calendar, RefreshCw, ChevronRight 
} from 'lucide-react';
import type { Sale, Transaction, Room, AIRecommendation } from '../../types';
import { generateAIInsights } from '../../services/aiEngine';
import { db } from '../../db/db';

interface DashboardViewProps {
  onGoToTab: (tab: 'vender' | 'cuartos' | 'inventario' | 'dinero') => void;
  onOpenQuickExpense: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onGoToTab, onOpenQuickExpense }) => {
  const [todayStr] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  // Formato bonito de fecha (ej. "Domingo, 27 de Septiembre")
  const formattedDate = new Intl.DateTimeFormat('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [todaySales, todayTransactions, allRooms] = await Promise.all([
        db.sales.where('dateString').equals(todayStr).toArray(),
        db.transactions.where('dateString').equals(todayStr).toArray(),
        db.rooms.toArray(),
      ]);

      setSales(todaySales);
      setTransactions(todayTransactions);
      setRooms(allRooms);

      // Cargar recomendaciones de IA
      const insights = await generateAIInsights(new Date());
      setRecommendations(insights);
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [todayStr]);

  // Cálculos financieros del día (Slide 22)
  const totalEntro = transactions
    .filter(t => t.type === 'ingreso')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSalio = transactions
    .filter(t => t.type === 'egreso')
    .reduce((sum, t) => sum + t.amount, 0);

  const hoyGanaste = totalEntro - totalSalio;

  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter(r => r.status === 'ocupada').length;

  return (
    <div className="flex-1 overflow-y-auto pb-16 p-3 sm:p-5 max-w-4xl mx-auto space-y-4">
      {/* 1. Tarjeta Principal: HOY GANASTE (Slide 22) */}
      <div className="bg-gradient-to-br from-cyan-900 via-teal-800 to-cyan-950 rounded-2xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden border border-teal-600/40">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-36 h-36 bg-amber-400/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-teal-200 text-xs sm:text-sm font-semibold uppercase tracking-wider">
            <Calendar className="w-4 h-4 text-amber-300" />
            <span>Hoy Ganaste · {formattedDate}</span>
          </div>
          <button
            onClick={loadDashboardData}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-teal-100"
            title="Actualizar datos"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Monto Central Gigante */}
        <div className="my-3">
          <h2 className={`text-4xl sm:text-5xl font-black tracking-tight ${hoyGanaste >= 0 ? 'text-amber-300' : 'text-rose-300'}`}>
            ${hoyGanaste.toLocaleString('es-MX')}
          </h2>
          <p className="text-xs sm:text-sm text-teal-100 font-medium">
            Lo que entró menos lo que salió hoy
          </p>
        </div>

        {/* Tres Métricas Clave (Entró, Salió, Cuartos) */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-4 pt-3 border-t border-teal-700/50">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 sm:p-3">
            <div className="flex items-center gap-1 text-[11px] sm:text-xs text-teal-200">
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
              <span>Entró ({sales.length} ventas)</span>
            </div>
            <p className="text-sm sm:text-lg font-black text-emerald-300 mt-0.5">
              ${totalEntro.toLocaleString('es-MX')}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 sm:p-3">
            <div className="flex items-center gap-1 text-[11px] sm:text-xs text-teal-200">
              <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
              <span>Salió</span>
            </div>
            <p className="text-sm sm:text-lg font-black text-rose-300 mt-0.5">
              ${totalSalio.toLocaleString('es-MX')}
            </p>
          </div>

          <button
            onClick={() => onGoToTab('cuartos')}
            className="bg-white/10 hover:bg-white/20 active:bg-white/30 backdrop-blur-sm rounded-xl p-2.5 sm:p-3 text-left transition-colors"
          >
            <div className="flex items-center gap-1 text-[11px] sm:text-xs text-teal-200">
              <BedDouble className="w-3.5 h-3.5 text-amber-300" />
              <span>Cuartos</span>
            </div>
            <p className="text-sm sm:text-lg font-black text-white mt-0.5">
              {occupiedRooms} de {totalRooms}
            </p>
          </button>
        </div>
      </div>

      {/* 2. Botones de Acción Rápida Touch */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
        <button
          onClick={() => onGoToTab('vender')}
          className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-98 text-cyan-950 font-black py-3.5 px-4 rounded-xl shadow-lg flex items-center justify-center gap-2 touch-press"
        >
          <ShoppingCart className="w-5 h-5 text-cyan-950" />
          <span className="text-sm sm:text-base font-extrabold">Vender Ahora</span>
        </button>

        <button
          onClick={onOpenQuickExpense}
          className="bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-800 border-2 border-slate-200 font-bold py-3.5 px-4 rounded-xl shadow-sm flex items-center justify-center gap-2 touch-press"
        >
          <PlusCircle className="w-5 h-5 text-rose-500" />
          <span className="text-sm sm:text-base">Gasto Rápido</span>
        </button>

        <button
          onClick={() => onGoToTab('cuartos')}
          className="col-span-2 sm:col-span-1 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-800 border-2 border-slate-200 font-bold py-3.5 px-4 rounded-xl shadow-sm flex items-center justify-center gap-2 touch-press"
        >
          <BedDouble className="w-5 h-5 text-cyan-700" />
          <span className="text-sm sm:text-base">Ver Cuartos</span>
        </button>
      </div>

      {/* 3. Módulo Estrella: ⭐ Asistente del día (IA explicable de la Costa Chica - Slide 22) */}
      <div className="bg-amber-50/70 border-2 border-amber-300/80 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-amber-900">
          <div className="w-8 h-8 rounded-lg bg-amber-400 text-cyan-950 flex items-center justify-center font-bold shadow">
            <Sparkles className="w-4.5 h-4.5 text-cyan-900" />
          </div>
          <div>
            <h3 className="font-black text-sm sm:text-base text-amber-950 flex items-center gap-1.5">
              Asistente del día <span className="bg-amber-200 text-amber-900 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">IA Ligera</span>
            </h3>
            <p className="text-xs text-amber-800">
              Pronósticos y recomendaciones basadas en tus números con su porqué
            </p>
          </div>
        </div>

        <div className="space-y-2.5">
          {recommendations.length === 0 ? (
            <div className="bg-white rounded-xl p-3 text-center text-xs text-slate-500">
              Calculando promedios y pronósticos...
            </div>
          ) : (
            recommendations.map((rec) => {
              const isAlert = rec.urgency === 'alert';
              const isWarning = rec.urgency === 'warning';

              return (
                <div
                  key={rec.id}
                  className={`bg-white rounded-xl p-3.5 border shadow-sm transition-all ${
                    isAlert
                      ? 'border-rose-300 bg-rose-50/30'
                      : isWarning
                      ? 'border-amber-300'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <p className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                        • {rec.description}
                      </p>
                      <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed italic bg-slate-50 p-1.5 rounded-md border border-slate-100">
                        💡 <span className="font-semibold text-slate-600">Por qué:</span> {rec.rationale}
                      </p>
                    </div>

                    {rec.suggestedAction && (
                      <button
                        onClick={() => {
                          if (rec.suggestedAction?.actionType === 'restock') {
                            onGoToTab('inventario');
                          } else if (rec.suggestedAction?.actionType === 'view_pos') {
                            onGoToTab('vender');
                          }
                        }}
                        className="shrink-0 text-xs font-bold px-2.5 py-1.5 bg-cyan-700 hover:bg-cyan-800 active:bg-cyan-900 text-white rounded-lg shadow-sm flex items-center gap-1 touch-press"
                      >
                        <span>{rec.suggestedAction.label}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 4. Movimientos Recientes de Hoy */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm sm:text-base">
            Movimientos registrados hoy ({transactions.length})
          </h3>
          <button
            onClick={() => onGoToTab('dinero')}
            className="text-xs font-bold text-cyan-700 hover:text-cyan-800"
          >
            Ver todos en Dinero →
          </button>
        </div>

        {transactions.length === 0 ? (
          <p className="text-center py-6 text-xs text-slate-400">
            Aún no hay ventas ni gastos registrados hoy. Toca "Vender Ahora" para registrar tu primera comanda.
          </p>
        ) : (
          <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
            {transactions.slice(-6).reverse().map((t) => {
              const isIncome = t.type === 'ingreso';
              const time = new Date(t.date).toLocaleTimeString('es-MX', {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div key={t.id} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${
                        isIncome ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {isIncome ? '↓' : '↑'}
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-slate-800">
                        {t.description}
                      </p>
                      <p className="text-[10px] sm:text-xs text-slate-400">
                        {t.category} · {time} · {t.paymentMethod}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs sm:text-sm font-black ${
                      isIncome ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {isIncome ? '+' : '-'}${t.amount.toLocaleString('es-MX')}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
