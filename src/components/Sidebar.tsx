import React from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  ChefHat,
  BedDouble,
  Package,
  Wallet,
  Users,
  Compass,
  PlusCircle,
  LogOut,
  QrCode,
  Settings,
} from 'lucide-react';
import type { BusinessConfig, StaffUser, UserRole } from '../types';

export type ActiveTab =
  | 'hoy'
  | 'vender'
  | 'mesero'
  | 'cocina'
  | 'cuartos'
  | 'inventario'
  | 'dinero'
  | 'personal';

interface SidebarProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  user: StaffUser;
  config: BusinessConfig | null;
  occupiedRoomsCount?: number;
  lowStockCount?: number;
  pendingKitchenOrdersCount?: number;
  onOpenPublicMenu: () => void;
  onOpenSettings: () => void;
  onOpenQuickExpense: () => void;
  onLogout: () => void;
}

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrador',
  cajero: 'Cajero POS',
  mesero: 'Mesero',
  cocina: 'Cocina / KDS',
  recepcion: 'Recepción',
};

const ROLE_PERMISSIONS: Record<UserRole, ActiveTab[]> = {
  admin: ['hoy', 'vender', 'mesero', 'cocina', 'cuartos', 'inventario', 'dinero', 'personal'],
  cajero: ['hoy', 'vender', 'mesero', 'cuartos', 'inventario', 'dinero'],
  mesero: ['mesero', 'vender', 'cocina'],
  cocina: ['cocina', 'inventario'],
  recepcion: ['hoy', 'cuartos', 'dinero'],
};

export function getAllowedTabsForRole(role: UserRole): ActiveTab[] {
  return ROLE_PERMISSIONS[role] || ['hoy'];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onChangeTab,
  user,
  config,
  occupiedRoomsCount = 0,
  lowStockCount = 0,
  pendingKitchenOrdersCount = 0,
  onOpenPublicMenu,
  onOpenSettings,
  onOpenQuickExpense,
  onLogout,
}) => {
  const allowedTabs = getAllowedTabsForRole(user.role);

  const allNavItems: Array<{
    id: ActiveTab;
    label: string;
    icon: React.FC<{ className?: string }>;
    badge: string | null;
    badgeColor?: string;
    desc: string;
  }> = [
    { id: 'hoy', label: 'Panel Hoy', icon: LayoutDashboard, badge: null, desc: 'Métricas e IA' },
    { id: 'vender', label: 'Caja POS', icon: ShoppingBag, badge: null, desc: 'Cobro rápido' },
    { id: 'mesero', label: 'Mesas', icon: UtensilsCrossed, badge: null, desc: 'Comandero' },
    {
      id: 'cocina',
      label: 'Cocina KDS',
      icon: ChefHat,
      badge: pendingKitchenOrdersCount > 0 ? String(pendingKitchenOrdersCount) : null,
      badgeColor: 'bg-amber-500 text-slate-950',
      desc: 'Órdenes en vivo',
    },
    {
      id: 'cuartos',
      label: 'Hospedaje',
      icon: BedDouble,
      badge: occupiedRoomsCount > 0 ? String(occupiedRoomsCount) : null,
      badgeColor: 'bg-sky-500 text-white',
      desc: 'Cabañas',
    },
    {
      id: 'inventario',
      label: 'Inventario',
      icon: Package,
      badge: lowStockCount > 0 ? String(lowStockCount) : null,
      badgeColor: 'bg-rose-500 text-white',
      desc: 'Catálogo y stock',
    },
    { id: 'dinero', label: 'Finanzas', icon: Wallet, badge: null, desc: 'Caja y RESICO' },
    { id: 'personal', label: 'Personal', icon: Users, badge: null, desc: 'Roles y PINs' },
  ];

  const navItems = allNavItems.filter((item) => allowedTabs.includes(item.id));

  const canRecordExpense = ['admin', 'cajero', 'recepcion'].includes(user.role);

  return (
    <aside className="w-[72px] sm:w-56 md:w-60 bg-[#0B3954] text-white flex flex-col justify-between shrink-0 border-r border-slate-800/40 select-none z-30 h-full">
      {/* Marca Principal (Única en toda la pantalla) */}
      <div className="flex flex-col min-h-0 flex-1">
        <div className="p-3 sm:px-4 sm:py-4 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400 text-[#0B3954] flex items-center justify-center shadow-md shrink-0">
            <Compass className="w-6 h-6 stroke-[2.4]" />
          </div>
          <div className="hidden sm:block min-w-0">
            <h1 className="text-sm font-extrabold tracking-tight text-white leading-tight truncate">
              Timón Costa Chica
            </h1>
            <p className="text-[11px] text-sky-200/80 font-medium truncate">
              {config?.municipio || 'Copala'}, Guerrero
            </p>
          </div>
        </div>

        {/* Botón rápido de gasto para roles financieros */}
        {canRecordExpense && (
          <div className="p-2 sm:px-3 sm:pt-3 sm:pb-1">
            <button
              type="button"
              onClick={onOpenQuickExpense}
              className="w-full py-2.5 px-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm touch-press"
              title="Registrar gasto rápido"
            >
              <PlusCircle className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Registrar Gasto</span>
            </button>
          </div>
        )}

        {/* Navegación Vertical */}
        <nav className="flex-1 overflow-y-auto px-2 sm:px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChangeTab(item.id)}
                className={`w-full flex items-center gap-3 p-2.5 sm:px-3 sm:py-2.5 rounded-xl font-semibold transition-all text-left touch-press relative ${
                  isActive
                    ? 'bg-white text-[#0B3954] shadow-md font-bold'
                    : 'text-slate-200 hover:bg-white/10'
                }`}
              >
                <div className="relative shrink-0 flex items-center justify-center">
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.4] text-[#0B3954]' : 'stroke-[1.9]'}`} />
                  {item.badge && (
                    <span
                      className={`sm:hidden absolute -top-1.5 -right-1.5 text-[9px] font-extrabold rounded-full min-w-4 h-4 px-1 flex items-center justify-center ${
                        item.badgeColor || 'bg-amber-400 text-slate-900'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>

                <div className="hidden sm:flex flex-1 items-center justify-between min-w-0">
                  <div className="min-w-0">
                    <span className="text-xs sm:text-[13px] block leading-tight truncate">
                      {item.label}
                    </span>
                    <span
                      className={`text-[10px] block font-medium truncate ${
                        isActive ? 'text-slate-500' : 'text-sky-200/60'
                      }`}
                    >
                      {item.desc}
                    </span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-extrabold rounded-full px-2 py-0.5 shrink-0 ${
                        item.badgeColor || 'bg-amber-400 text-slate-900'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer de Usuario y Accesos */}
      <div className="p-2 sm:p-3 border-t border-white/10 bg-[#072436] space-y-2">
        <div className="hidden sm:flex items-center justify-between px-2 py-1.5 rounded-xl bg-white/5">
          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate">{user.name}</p>
            <p className="text-[10px] text-amber-300 font-semibold truncate">
              {ROLE_LABELS[user.role]}
            </p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white touch-press"
            title="Cambiar usuario / Cerrar turno"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="sm:hidden w-full p-2 rounded-xl bg-white/10 text-slate-200 flex items-center justify-center touch-press"
          title="Cambiar usuario"
        >
          <LogOut className="w-4 h-4" />
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={onOpenPublicMenu}
            className="flex items-center justify-center gap-1.5 py-2 px-2 bg-[#087E8B] hover:bg-[#0993A2] rounded-xl text-xs font-bold text-white touch-press"
            title="Menú Digital QR"
          >
            <QrCode className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline text-[11px]">Menú QR</span>
          </button>
          {user.role === 'admin' && (
            <button
              type="button"
              onClick={onOpenSettings}
              className="flex items-center justify-center gap-1.5 py-2 px-2 bg-white/10 hover:bg-white/15 rounded-xl text-xs font-bold text-slate-200 touch-press"
              title="Configuración"
            >
              <Settings className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline text-[11px]">Ajustes</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
