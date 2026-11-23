import React, { useState, useEffect } from 'react';
import {
  Flame,
  Clock,
  CheckCircle2,
  ChefHat,
  Check,
  RefreshCw,
  Printer,
  Filter,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { BusinessConfig, KitchenStation, Order, OrderStatus } from '../../types';
import { api } from '../../services/api';
import { printThermalTicket } from '../../services/pdfService';

interface CocinaViewProps {
  config: BusinessConfig | null;
}

export const CocinaView: React.FC<CocinaViewProps> = ({ config }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filterStatus, setFilterStatus] = useState<'todas' | 'pendiente' | 'en_preparacion' | 'listo'>('todas');
  const [filterStation, setFilterStation] = useState<'todas' | KitchenStation>('todas');
  const [loading, setLoading] = useState(false);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const list = await api.getOrders({ status: 'pendiente,en_preparacion,listo' });
      setOrders(list);
    } catch (err) {
      console.error('Error cargando KDS:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    await api.updateOrder(orderId, { status: newStatus });
    if (newStatus === 'listo') {
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
    }
    await loadOrders();
  };

  const filtered = orders.filter((o) => {
    const matchStatus = filterStatus === 'todas' || o.status === filterStatus;
    const matchStation =
      filterStation === 'todas' || o.items.some((i) => (i.station || 'cocina') === filterStation);
    return matchStatus && matchStation;
  });

  const pendientesCount = orders.filter((o) => o.status === 'pendiente').length;
  const enPrepCount = orders.filter((o) => o.status === 'en_preparacion').length;
  const listosCount = orders.filter((o) => o.status === 'listo').length;

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-5 pb-16">
      {/* Cabecera KDS */}
      <div className="bg-[#0B3954] text-white rounded-2xl p-5 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-400 text-[#0B3954] flex items-center justify-center shadow">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white leading-tight">
                Pantalla de Cocina y Estaciones (KDS)
              </h2>
              <p className="text-xs text-sky-200">
                Sincronización en vivo con MongoDB · Semáforo automático de tiempo de preparación
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={loadOrders}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 touch-press self-start sm:self-auto"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualizar Cola</span>
          </button>
        </div>

        {/* Filtros de Estado y Estación */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2 border-t border-white/10">
          <div className="flex flex-wrap gap-2">
            {(
              [
                { id: 'todas', label: `Todas (${orders.length})` },
                { id: 'pendiente', label: `Nuevas (${pendientesCount})` },
                { id: 'en_preparacion', label: `En Fuego (${enPrepCount})` },
                { id: 'listo', label: `Listas (${listosCount})` },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterStatus(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold touch-press ${
                  filterStatus === tab.id
                    ? 'bg-amber-400 text-slate-950'
                    : 'bg-white/10 text-sky-100 hover:bg-white/15'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-sky-300" />
            {(
              [
                { id: 'todas', label: 'Todas las áreas' },
                { id: 'cocina', label: 'Brasas / Caliente' },
                { id: 'fria', label: 'Barra Fría' },
                { id: 'barra', label: 'Bebidas' },
              ] as const
            ).map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setFilterStation(st.id)}
                className={`px-2.5 py-1.5 rounded-lg font-bold touch-press ${
                  filterStation === st.id
                    ? 'bg-white text-[#0B3954]'
                    : 'bg-white/10 text-sky-200 hover:bg-white/15'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tarjetas de Comandas */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs space-y-2">
          <ChefHat className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-extrabold text-base text-slate-800">Cola de cocina despejada</h3>
          <p className="text-xs text-slate-500">
            Las nuevas órdenes tomadas en el módulo Mesas aparecerán aquí automáticamente.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((order) => {
            const minutesAgo = Math.max(
              0,
              Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000)
            );
            const isUrgentTime = minutesAgo >= 15 && order.status !== 'listo';
            const isPendiente = order.status === 'pendiente';
            const isEnPrep = order.status === 'en_preparacion';
            const isListo = order.status === 'listo';

            return (
              <div
                key={order.id}
                className={`rounded-2xl border-2 bg-white shadow-sm overflow-hidden flex flex-col justify-between ${
                  isPendiente
                    ? 'border-rose-400'
                    : isEnPrep
                    ? 'border-amber-400'
                    : 'border-emerald-500'
                }`}
              >
                <div
                  className={`px-4 py-3 text-white flex items-center justify-between ${
                    isPendiente
                      ? 'bg-rose-600'
                      : isEnPrep
                      ? 'bg-amber-600'
                      : 'bg-emerald-600'
                  }`}
                >
                  <div>
                    <h3 className="text-base font-extrabold leading-tight">
                      {order.tableOrRamada}
                    </h3>
                    <p className="text-[11px] opacity-90">
                      {order.folio} · {order.waiterName}
                    </p>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-xs font-extrabold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                        isUrgentTime ? 'bg-slate-950 text-amber-300' : 'bg-black/20 text-white'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      {minutesAgo} min
                    </span>
                    <span className="block text-[10px] font-bold uppercase mt-0.5">
                      {isPendiente ? 'Pendiente' : isEnPrep ? 'En Preparación' : 'Lista para servir'}
                    </span>
                  </div>
                </div>

                {/* Lista de platillos */}
                <div className="p-4 flex-1 divide-y divide-slate-100 space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="pt-2 first:pt-0">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-extrabold text-slate-900">
                          <span className="text-[#087E8B] mr-1.5">{item.quantity}x</span>
                          {item.name}
                        </span>
                        <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                          {item.station || 'cocina'}
                        </span>
                      </div>
                      {item.notes && (
                        <p className="mt-1 text-xs font-bold text-amber-900 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg">
                          Especificación: {item.notes}
                        </p>
                      )}
                    </div>
                  ))}

                  {order.notes && (
                    <div className="pt-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-800">Nota mesa:</span> {order.notes}
                    </div>
                  )}
                </div>

                {/* Acciones táctiles KDS */}
                <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      printThermalTicket(order, config, 'cocina', config?.thermalPaperWidth || '80mm')
                    }
                    className="p-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 touch-press"
                    title="Imprimir comanda térmica"
                  >
                    <Printer className="w-4 h-4" />
                  </button>

                  {isPendiente && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(order.id, 'en_preparacion')}
                      className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 touch-press"
                    >
                      <Flame className="w-4 h-4" />
                      <span>Iniciar Preparación</span>
                    </button>
                  )}

                  {isEnPrep && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(order.id, 'listo')}
                      className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 touch-press"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Marcar Lista</span>
                    </button>
                  )}

                  {isListo && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(order.id, 'entregado')}
                      className="flex-1 py-3 bg-[#0B3954] hover:bg-[#082C42] text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 touch-press"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Entregada a Mesa</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
