import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  BedDouble,
  ShoppingBag,
  PlusCircle,
  RefreshCw,
  ChevronRight,
  AlertTriangle,
  Info,
  UtensilsCrossed,
  BarChart3,
  PieChart as PieChartIcon,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { api } from '../../services/api';
import type { AnalyticsResponse } from '../../types';
import type { ActiveTab } from '../Sidebar';

interface DashboardViewProps {
  onGoToTab: (tab: ActiveTab) => void;
  onOpenQuickExpense: () => void;
}

const PIE_COLORS = ['#0B3954', '#087E8B', '#D97706'];

export const DashboardView: React.FC<DashboardViewProps> = ({
  onGoToTab,
  onOpenQuickExpense,
}) => {
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const formattedDate = new Intl.DateTimeFormat('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await api.getAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error('Error cargando analítica:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const summary = analytics?.todaySummary || {
    ingresos: 0,
    egresos: 0,
    utilidad: 0,
    occupiedRooms: 0,
    totalRooms: 0,
    openOrdersCount: 0,
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-6 pb-16">
      {/* Encabezado Ejecutivo y Acciones Rápidas */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 capitalize">
            <Calendar className="w-4 h-4 text-[#087E8B]" />
            <span>{formattedDate}</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            Resumen Operativo y Financiero
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={loadAnalytics}
            className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 touch-press shadow-xs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>

          <button
            type="button"
            onClick={onOpenQuickExpense}
            className="px-4 py-2.5 rounded-xl bg-white border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-bold flex items-center gap-1.5 touch-press shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Registrar Gasto</span>
          </button>

          <button
            type="button"
            onClick={() => onGoToTab('vender')}
            className="px-4 py-2.5 rounded-xl bg-[#0B3954] hover:bg-[#082C42] text-white text-xs font-bold flex items-center gap-1.5 touch-press shadow-sm"
          >
            <ShoppingBag className="w-4 h-4 text-amber-400" />
            <span>Ir a Caja POS</span>
          </button>
        </div>
      </div>

      {/* KPIs Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Utilidad Neta */}
        <div className="bg-[#0B3954] text-white rounded-2xl p-5 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-sky-200">Utilidad Neta de Hoy</span>
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-extrabold tracking-tight text-white">
              ${summary.utilidad.toLocaleString('es-MX')}
            </p>
            <p className="text-xs text-sky-200/80 mt-1">
              Ingresos menos egresos del turno actual
            </p>
          </div>
        </div>

        {/* Ingresos */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Ingresos del Día</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              ${summary.ingresos.toLocaleString('es-MX')}
            </p>
            <p className="text-xs text-emerald-600 font-semibold mt-1">
              Ventas POS y hospedaje cobrado
            </p>
          </div>
        </div>

        {/* Egresos */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Egresos y Compras</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              ${summary.egresos.toLocaleString('es-MX')}
            </p>
            <p className="text-xs text-rose-600 font-semibold mt-1">
              Insumos, hielo, gas y operación
            </p>
          </div>
        </div>

        {/* Ocupación y Mesas */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Ocupación y Servicio</span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-[#087E8B] flex items-center justify-center">
              <BedDouble className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-end justify-between">
            <div>
              <p className="text-2xl font-extrabold text-slate-900">
                {summary.occupiedRooms} / {summary.totalRooms}
              </p>
              <p className="text-xs text-slate-500 font-medium">Cabañas ocupadas</p>
            </div>
            <button
              type="button"
              onClick={() => onGoToTab('cocina')}
              className="px-2.5 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center gap-1 touch-press"
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>{summary.openOrdersCount} activas</span>
            </button>
          </div>
        </div>
      </div>

      {/* Gráficas Interactivas (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Gráfica 1: Ingresos vs Egresos 14 días */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#087E8B]" />
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Flujo de Ingresos vs Egresos (Últimos 14 días)
                </h3>
                <p className="text-xs text-slate-500">
                  Seguimiento diario de ventas y compras en MXN
                </p>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.dailySeries || []} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#087E8B" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#087E8B" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorEgresos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E11D48" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#E11D48" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  formatter={(value: any) => [`$${Number(value).toLocaleString('es-MX')} MXN`, '']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                />
                <Area
                  type="monotone"
                  dataKey="ingresos"
                  name="Ingresos"
                  stroke="#087E8B"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorIngresos)"
                />
                <Area
                  type="monotone"
                  dataKey="egresos"
                  name="Egresos"
                  stroke="#E11D48"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorEgresos)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfica 2: Distribución de Métodos de Pago */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <PieChartIcon className="w-5 h-5 text-[#0B3954]" />
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Métodos de Cobro</h3>
              <p className="text-xs text-slate-500">Distribución histórica de ingresos</p>
            </div>
          </div>

          <div className="h-48 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics?.paymentBreakdown || []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={74}
                  paddingAngle={4}
                >
                  {(analytics?.paymentBreakdown || []).map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => `$${Number(value).toLocaleString('es-MX')} MXN`} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center">
            {(analytics?.paymentBreakdown || []).map((item, idx) => (
              <div key={item.name}>
                <div className="flex items-center justify-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                  />
                  <span className="text-[11px] font-bold text-slate-600">{item.name}</span>
                </div>
                <p className="text-xs font-extrabold text-slate-900 mt-0.5">
                  ${item.value.toLocaleString('es-MX')}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fila Inferior: Top Platillos + Asistente IA Explicable */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Top Platillos */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <h3 className="text-sm font-extrabold text-slate-900 mb-1">
            Platillos con Mayor Ingreso
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Ranking de productos líderes en ventas registradas
          </p>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analytics?.topProducts || []}
                layout="vertical"
                margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(v) => `$${v}`} />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={145}
                  tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }}
                />
                <Tooltip formatter={(value: any) => [`$${Number(value).toLocaleString('es-MX')} MXN`, 'Ventas']} />
                <Bar dataKey="revenue" fill="#0B3954" radius={[0, 8, 8, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Asistente IA Ligera Explicable */}
        <div className="lg:col-span-6 bg-[#FAF8F5] rounded-2xl p-5 border border-amber-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#0B3954] text-amber-400 flex items-center justify-center shadow-xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Asistente del Día · IA Ligera Explicable
                </h3>
                <p className="text-xs text-slate-600">
                  Pronósticos por día de la semana y alertas de abasto
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
            {(analytics?.aiInsights || []).map((rec) => {
              const isAlert = rec.urgency === 'alert';
              const isWarning = rec.urgency === 'warning';

              return (
                <div
                  key={rec.id}
                  className={`bg-white rounded-xl p-3.5 border shadow-2xs flex items-start justify-between gap-3 ${
                    isAlert
                      ? 'border-rose-300'
                      : isWarning
                      ? 'border-amber-300'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div
                      className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${
                        isAlert
                          ? 'bg-rose-100 text-rose-700'
                          : isWarning
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-sky-100 text-[#0B3954]'
                      }`}
                    >
                      {isAlert || isWarning ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : (
                        <Info className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                        {rec.description}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        <span className="font-semibold text-slate-700">Sustento:</span> {rec.rationale}
                      </p>
                    </div>
                  </div>

                  {rec.suggestedAction && (
                    <button
                      type="button"
                      onClick={() => onGoToTab('inventario')}
                      className="shrink-0 px-2.5 py-1.5 rounded-lg bg-[#0B3954] hover:bg-[#082C42] text-white text-xs font-bold flex items-center gap-1 touch-press"
                    >
                      <span>{rec.suggestedAction.label}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
