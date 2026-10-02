import React, { useState, useEffect } from 'react';
import { 
  Flame, Clock, CheckCircle2, ChefHat, Check, RefreshCw 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { KitchenOrder, OrderStatus } from '../../types';
import { db } from '../../db/db';

export const CocinaView: React.FC = () => {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [filterStatus, setFilterStatus] = useState<'todas' | 'pendiente' | 'en_preparacion' | 'listo'>('todas');
  const [loading, setLoading] = useState(false);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const list = await db.kitchenOrders
        .where('status')
        .anyOf(['pendiente', 'en_preparacion', 'listo'])
        .reverse()
        .sortBy('createdAt');
      setOrders(list);
    } catch (err) {
      console.error('Error cargando órdenes de cocina:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 10000); // Refresco automático cada 10 seg
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (orderId: number, newStatus: OrderStatus) => {
    await db.kitchenOrders.update(orderId, { status: newStatus });
    if (newStatus === 'listo') {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
    await loadOrders();
  };

  const handleDismiss = async (orderId: number) => {
    await db.kitchenOrders.update(orderId, { status: 'entregado' });
    await loadOrders();
  };

  // Filtrado
  const filtered = orders.filter(o => filterStatus === 'todas' || o.status === filterStatus);

  const pendientesCount = orders.filter(o => o.status === 'pendiente').length;
  const enPrepCount = orders.filter(o => o.status === 'en_preparacion').length;
  const listosCount = orders.filter(o => o.status === 'listo').length;

  return (
    <div className="flex-1 overflow-y-auto pb-16 p-3 sm:p-5 max-w-6xl mx-auto space-y-4 select-none">
      {/* Cabecera de Cocina KDS */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-md space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-lg">
              <ChefHat className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-amber-300 tracking-tight leading-tight">
                Cocina & Brasas (Pantalla KDS)
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Comandas en vivo tomadas por meseros en mesas y ramadas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadOrders}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-slate-300 transition-all flex items-center gap-1.5 text-xs font-bold"
              title="Refrescar comandas"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Actualizar</span>
            </button>
          </div>
        </div>

        {/* Filtros rápidos con contadores táctiles */}
        <div className="grid grid-cols-4 gap-2 pt-1">
          <button
            onClick={() => setFilterStatus('todas')}
            className={`py-2 px-3 rounded-xl text-xs font-black transition-all touch-press ${
              filterStatus === 'todas'
                ? 'bg-white text-slate-950 shadow'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            Todas ({orders.length})
          </button>

          <button
            onClick={() => setFilterStatus('pendiente')}
            className={`py-2 px-3 rounded-xl text-xs font-black transition-all touch-press flex items-center justify-center gap-1.5 ${
              filterStatus === 'pendiente'
                ? 'bg-rose-600 text-white shadow ring-2 ring-rose-400/30'
                : 'bg-rose-950/60 text-rose-300 border border-rose-800/40 hover:bg-rose-900/50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-400"></span>
            <span>Nuevas ({pendientesCount})</span>
          </button>

          <button
            onClick={() => setFilterStatus('en_preparacion')}
            className={`py-2 px-3 rounded-xl text-xs font-black transition-all touch-press flex items-center justify-center gap-1.5 ${
              filterStatus === 'en_preparacion'
                ? 'bg-amber-500 text-slate-950 shadow ring-2 ring-amber-400/30'
                : 'bg-amber-950/60 text-amber-300 border border-amber-800/40 hover:bg-amber-900/50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>En Fuego ({enPrepCount})</span>
          </button>

          <button
            onClick={() => setFilterStatus('listo')}
            className={`py-2 px-3 rounded-xl text-xs font-black transition-all touch-press flex items-center justify-center gap-1.5 ${
              filterStatus === 'listo'
                ? 'bg-emerald-600 text-white shadow ring-2 ring-emerald-400/30'
                : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40 hover:bg-emerald-900/50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Listas ({listosCount})</span>
          </button>
        </div>
      </div>

      {/* Grid de Comandas de Cocina */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm space-y-2">
          <ChefHat className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-extrabold text-base text-slate-800">
            No hay comandas pendientes en cocina
          </h3>
          <p className="text-xs text-slate-500">
            Cuando un mesero tome una orden en la sección "Mesero", aparecerá aquí automáticamente.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filtered.map((order) => {
            const minutesAgo = Math.floor(
              (Date.now() - new Date(order.createdAt).getTime()) / 60000
            );

            const isPendiente = order.status === 'pendiente';
            const isEnPrep = order.status === 'en_preparacion';
            const isListo = order.status === 'listo';

            return (
              <div
                key={order.id}
                className={`rounded-2xl border-2 shadow-md overflow-hidden flex flex-col justify-between transition-all bg-white ${
                  isPendiente
                    ? 'border-rose-400 ring-2 ring-rose-300/40'
                    : isEnPrep
                    ? 'border-amber-400 ring-2 ring-amber-300/40'
                    : 'border-emerald-400 ring-2 ring-emerald-300/40'
                }`}
              >
                {/* Cabecera del Ticket */}
                <div
                  className={`p-3 text-white flex items-center justify-between ${
                    isPendiente
                      ? 'bg-rose-600'
                      : isEnPrep
                      ? 'bg-amber-600'
                      : 'bg-emerald-600'
                  }`}
                >
                  <div>
                    <h3 className="text-base sm:text-lg font-black leading-tight">
                      {order.tableOrRamada}
                    </h3>
                    <p className="text-[11px] opacity-90">
                      Atiende: {order.waiterName || 'Mesero'}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-black bg-black/25 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Hace {minutesAgo} min
                    </span>
                    <span className="block text-[10px] font-bold uppercase mt-0.5 tracking-wider">
                      {isPendiente ? '🔔 NUEVA' : isEnPrep ? '🔥 EN PREPARACIÓN' : '✅ LISTA'}
                    </span>
                  </div>
                </div>

                {/* Lista de Platillos a Cocinar */}
                <div className="p-3.5 space-y-2 flex-1 divide-y divide-slate-100">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="pt-2 first:pt-0">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                          <span className="text-cyan-800 mr-1.5">{item.quantity}x</span>
                          {item.name}
                        </span>
                      </div>

                      {/* Notas específicas de cocina */}
                      {item.notes && (
                        <div className="mt-1 inline-block text-[11px] font-extrabold text-amber-900 bg-amber-100/90 border border-amber-300 px-2 py-0.5 rounded-md">
                          👉 {item.notes}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Notas generales de la mesa */}
                  {order.notes && (
                    <div className="pt-2 text-xs text-slate-600 italic bg-slate-50 p-2 rounded-xl mt-2 border border-slate-100">
                      📝 Nota general: {order.notes}
                    </div>
                  )}
                </div>

                {/* Botones de Acción Táctiles para el Cocinero */}
                <div className="p-3 bg-slate-50 border-t border-slate-200 space-y-1.5">
                  <div className="grid grid-cols-2 gap-1.5">
                    {isPendiente && (
                      <button
                        onClick={() => handleUpdateStatus(order.id!, 'en_preparacion')}
                        className="col-span-2 py-3 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-black rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow touch-press"
                      >
                        <Flame className="w-4 h-4" />
                        <span>Poner en Fuego / Preparar</span>
                      </button>
                    )}

                    {isEnPrep && (
                      <button
                        onClick={() => handleUpdateStatus(order.id!, 'listo')}
                        className="col-span-2 py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md touch-press"
                      >
                        <Check className="w-5 h-5 stroke-[3]" />
                        <span>¡LISTO PARA SERVIR!</span>
                      </button>
                    )}

                    {isListo && (
                      <button
                        onClick={() => handleDismiss(order.id!)}
                        className="col-span-2 py-3 bg-slate-800 hover:bg-slate-900 active:bg-black text-white font-black rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow touch-press"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Entregado a Mesa / Retirar</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
