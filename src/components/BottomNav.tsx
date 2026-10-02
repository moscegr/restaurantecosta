import React from 'react';
import { Home, ShoppingBag, BedDouble, Package, Wallet } from 'lucide-react';

export type ActiveTab = 'hoy' | 'vender' | 'cuartos' | 'inventario' | 'dinero';

interface BottomNavProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  occupiedRoomsCount?: number;
  lowStockCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  occupiedRoomsCount = 0,
  lowStockCount = 0,
}) => {
  const tabs = [
    {
      id: 'hoy' as ActiveTab,
      label: 'Hoy',
      icon: Home,
      badge: null,
    },
    {
      id: 'vender' as ActiveTab,
      label: 'Vender',
      icon: ShoppingBag,
      badge: null,
      highlight: true,
    },
    {
      id: 'cuartos' as ActiveTab,
      label: 'Cuartos',
      icon: BedDouble,
      badge: occupiedRoomsCount > 0 ? `${occupiedRoomsCount}` : null,
      badgeColor: 'bg-cyan-600',
    },
    {
      id: 'inventario' as ActiveTab,
      label: 'Inventario',
      icon: Package,
      badge: lowStockCount > 0 ? `${lowStockCount}` : null,
      badgeColor: 'bg-rose-500',
    },
    {
      id: 'dinero' as ActiveTab,
      label: 'Dinero',
      icon: Wallet,
      badge: null,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-2xl z-30 select-none pb-safe">
      <div className="max-w-xl md:max-w-2xl mx-auto flex items-center justify-around h-16 sm:h-18 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`relative flex flex-col items-center justify-center flex-1 h-full py-1 transition-all touch-press ${
                isActive
                  ? 'text-cyan-800 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div
                className={`relative flex items-center justify-center rounded-2xl transition-all ${
                  isActive
                    ? 'bg-cyan-100/90 text-cyan-800 p-1.5 sm:px-4'
                    : 'p-1'
                }`}
              >
                <Icon className={`w-6 h-6 sm:w-6.5 sm:h-6.5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />

                {/* Badge de alerta/conteo */}
                {tab.badge && (
                  <span
                    className={`absolute -top-1 -right-1 text-white text-[10px] font-black rounded-full min-w-4.5 h-4.5 px-1 flex items-center justify-center shadow ${
                      tab.badgeColor || 'bg-amber-500'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </div>

              <span
                className={`text-[11px] sm:text-xs mt-0.5 tracking-tight ${
                  isActive ? 'font-black text-cyan-900' : 'font-medium'
                }`}
              >
                {tab.label}
              </span>

              {/* Indicador inferior activo */}
              {isActive && (
                <div className="absolute top-0 w-8 h-1 bg-cyan-700 rounded-b-full"></div>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
