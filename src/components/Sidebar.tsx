import React, { useState, useEffect } from 'react';
import { 
  Home, ShoppingBag, BedDouble, Package, Wallet, 
  QrCode, Settings, Wifi, WifiOff, Compass, PlusCircle 
} from 'lucide-react';
import type { BusinessConfig } from '../types';

export type ActiveTab = 'hoy' | 'vender' | 'cuartos' | 'inventario' | 'dinero';

interface SidebarProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  config: BusinessConfig | null;
  occupiedRoomsCount?: number;
  lowStockCount?: number;
  onOpenPublicMenu: () => void;
  onOpenSettings: () => void;
  onOpenQuickExpense: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onChangeTab,
  config,
  occupiedRoomsCount = 0,
  lowStockCount = 0,
  onOpenPublicMenu,
  onOpenSettings,
  onOpenQuickExpense,
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const navItems = [
    {
      id: 'hoy' as ActiveTab,
      label: 'Hoy',
      icon: Home,
      badge: null,
      desc: 'Resumen & IA',
    },
    {
      id: 'vender' as ActiveTab,
      label: 'Vender',
      icon: ShoppingBag,
      badge: null,
      desc: 'Punto de Venta',
    },
    {
      id: 'cuartos' as ActiveTab,
      label: 'Cuartos',
      icon: BedDouble,
      badge: occupiedRoomsCount > 0 ? `${occupiedRoomsCount}` : null,
      badgeColor: 'bg-cyan-600',
      desc: 'Hospedaje',
    },
    {
      id: 'inventario' as ActiveTab,
      label: 'Inventario',
      icon: Package,
      badge: lowStockCount > 0 ? `${lowStockCount}` : null,
      badgeColor: 'bg-rose-500',
      desc: 'Semáforo',
    },
    {
      id: 'dinero' as ActiveTab,
      label: 'Dinero',
      icon: Wallet,
      badge: null,
      desc: 'Caja & RESICO',
    },
  ];

  return (
    <aside className="w-20 sm:w-56 md:w-60 bg-gradient-to-b from-cyan-950 via-teal-950 to-slate-950 text-white flex flex-col justify-between shrink-0 border-r border-teal-800/40 select-none shadow-2xl z-30 h-full">
      {/* 1. Header / Logo del Negocio */}
      <div>
        <div className="p-3 sm:p-4 border-b border-teal-800/40 flex items-center gap-2.5 sm:gap-3 bg-cyan-900/30">
          <div className="w-10 h-10 rounded-xl bg-amber-400 text-cyan-950 flex items-center justify-center font-black text-xl shadow-lg border border-amber-300 shrink-0">
            <Compass className="w-6 h-6 text-cyan-950" />
          </div>
          <div className="hidden sm:block min-w-0">
            <h1 className="text-base font-black tracking-tight leading-tight text-white m-0 truncate">
              Timón <span className="text-amber-300 text-xs uppercase tracking-wider">Costa Chica</span>
            </h1>
            <p className="text-[11px] text-teal-200 font-semibold truncate">
              {config?.municipio || 'Copala'} · Gro.
            </p>
          </div>
        </div>

        {/* 2. Botón de Gasto Rápido en Sidebar */}
        <div className="p-2 sm:p-3">
          <button
            onClick={onOpenQuickExpense}
            className="w-full py-2.5 px-2 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all touch-press"
            title="Registrar Gasto Rápido (hielo, carbón, marisco)"
          >
            <PlusCircle className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Gasto Rápido</span>
          </button>
        </div>

        {/* 3. Menú de Navegación Vertical Táctil */}
        <nav className="px-2 sm:px-3 space-y-1.5 mt-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onChangeTab(item.id)}
                className={`w-full flex items-center gap-3 p-2.5 sm:py-3 sm:px-3.5 rounded-2xl font-bold transition-all text-left touch-press relative ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-cyan-950 shadow-lg font-black'
                    : 'text-teal-100 hover:bg-white/10 active:bg-white/15'
                }`}
              >
                <div className="relative shrink-0 flex items-center justify-center">
                  <Icon className={`w-5 h-5 sm:w-5.5 sm:h-5.5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                  
                  {/* Badge en modo móvil/icono */}
                  {item.badge && (
                    <span
                      className={`sm:hidden absolute -top-1.5 -right-1.5 text-white text-[9px] font-black rounded-full min-w-4 h-4 px-0.5 flex items-center justify-center shadow ${
                        item.badgeColor || 'bg-amber-500'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>

                <div className="hidden sm:flex flex-1 items-center justify-between min-w-0">
                  <div>
                    <span className="text-sm block leading-tight">{item.label}</span>
                    <span
                      className={`text-[10px] block font-medium ${
                        isActive ? 'text-cyan-950/80' : 'text-teal-300/70'
                      }`}
                    >
                      {item.desc}
                    </span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-white text-[10px] font-black rounded-full px-2 py-0.5 shadow ${
                        item.badgeColor || 'bg-amber-500'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>

                {/* Borde activo sutil */}
                {isActive && (
                  <div className="sm:hidden absolute left-0 top-2 bottom-2 w-1 bg-cyan-950 rounded-r-full"></div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* 4. Footer del Menú Lateral: Conexión, Menú QR y Ajustes */}
      <div className="p-2 sm:p-3 border-t border-teal-800/40 bg-cyan-950/60 space-y-2">
        {/* Indicador de Red Offline-First */}
        <div
          className={`flex items-center justify-center sm:justify-start gap-2 p-2 rounded-xl text-xs font-semibold border ${
            isOnline
              ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30'
              : 'bg-amber-500/20 text-amber-200 border-amber-400/30 animate-pulse'
          }`}
          title={isOnline ? 'Conectado a Internet' : 'Modo Sin Conexión activo. Los datos se guardan en la tablet.'}
        >
          {isOnline ? (
            <Wifi className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          ) : (
            <WifiOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          )}
          <span className="hidden sm:inline truncate">
            {isOnline ? 'En línea' : 'Sin conexión'}
          </span>
        </div>

        {/* Acciones Secundarias */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          <button
            onClick={onOpenPublicMenu}
            className="flex items-center justify-center gap-1.5 py-2 px-2 bg-teal-800/80 hover:bg-teal-700 active:bg-teal-900 rounded-xl text-xs font-bold text-teal-100 transition-all touch-press"
            title="Ver Menú Digital del Comensal y Código QR"
          >
            <QrCode className="w-4 h-4 text-amber-300 shrink-0" />
            <span className="hidden sm:inline">Menú QR</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="flex items-center justify-center gap-1.5 py-2 px-2 bg-teal-900/60 hover:bg-teal-800 active:bg-teal-950 rounded-xl text-xs font-bold text-teal-200 transition-all touch-press"
            title="Ajustes del Negocio y Datos Demo"
          >
            <Settings className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Ajustes</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
