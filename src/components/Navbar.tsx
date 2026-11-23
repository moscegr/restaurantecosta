import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Building2, Database, QrCode, Settings } from 'lucide-react';
import type { BusinessConfig, StaffUser } from '../types';

interface NavbarProps {
  config: BusinessConfig | null;
  user: StaffUser;
  activeTabTitle: string;
  onOpenPublicMenu: () => void;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  config,
  user,
  activeTabTitle,
  onOpenPublicMenu,
  onOpenSettings,
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  return (
    <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between select-none shrink-0 z-20">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 text-[#0B3954] flex items-center justify-center shrink-0">
          <Building2 className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <h2 className="text-sm sm:text-base font-extrabold text-slate-900 truncate leading-tight">
            {activeTabTitle}
          </h2>
          <p className="text-xs text-slate-500 font-medium truncate">
            {config?.businessName || 'Ramada & Cabañas Las Brisas'} · Turno activo: {user.name}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600"
          title="Conectado a base de datos MongoDB"
        >
          <Database className="w-3.5 h-3.5 text-emerald-600" />
          <span>MongoDB</span>
        </div>

        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${
            isOnline
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-amber-50 text-amber-800 border-amber-300'
          }`}
        >
          {isOnline ? (
            <>
              <Wifi className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">En línea</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-amber-600" />
              <span>Sin red</span>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={onOpenPublicMenu}
          className="px-3 py-1.5 bg-[#0B3954] hover:bg-[#082C42] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 touch-press shadow-xs"
        >
          <QrCode className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Menú y Reservas</span>
        </button>

        {user.role === 'admin' && (
          <button
            type="button"
            onClick={onOpenSettings}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 touch-press"
            title="Configuración del negocio"
          >
            <Settings className="w-3.5 h-3.5 text-[#0B3954]" />
            <span className="hidden md:inline">Ajustes</span>
          </button>
        )}
      </div>
    </header>
  );
};
