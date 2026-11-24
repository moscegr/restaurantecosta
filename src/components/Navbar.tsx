import React, { useState, useEffect } from 'react';
import {
  Wifi,
  WifiOff,
  Building2,
  QrCode,
  Settings,
  Menu,
  ChevronDown,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import type { BusinessConfig, StaffUser, UserRole } from '../types';

interface NavbarProps {
  config: BusinessConfig | null;
  user: StaffUser;
  activeTabTitle: string;
  onOpenPublicMenu: () => void;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  onOpenMobileMenu: () => void;
}

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  cajero: 'Cajero',
  mesero: 'Mesero',
  cocina: 'Cocina',
  recepcion: 'Recepción',
};

export const Navbar: React.FC<NavbarProps> = ({
  config,
  user,
  activeTabTitle,
  onOpenPublicMenu,
  onOpenSettings,
  onOpenProfile,
  onOpenMobileMenu,
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    const onFsChange = () => {
      const doc = document as any;
      setIsFullscreen(Boolean(doc.fullscreenElement || doc.webkitFullscreenElement));
    };
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
      document.removeEventListener('fullscreenchange', onFsChange);
      document.removeEventListener('webkitfullscreenchange', onFsChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    const doc = document as any;
    const el = document.documentElement as any;
    try {
      if (!doc.fullscreenElement && !doc.webkitFullscreenElement) {
        if (el.requestFullscreen) await el.requestFullscreen();
        else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
      } else {
        if (doc.exitFullscreen) await doc.exitFullscreen();
        else if (doc.webkitExitFullscreen) await doc.webkitExitFullscreen();
      }
    } catch {
      // Browser blocked fullscreen
    }
  };

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="bg-white border-b border-slate-200 px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2 select-none shrink-0 z-20">
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        {/* Botón Menú Hamburguesa en Smartphones (< md) */}
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0B3954] touch-press shrink-0"
          aria-label="Abrir menú de navegación"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 text-[#0B3954] items-center justify-center shrink-0">
          <Building2 className="w-5 h-5" />
        </div>

        <div className="min-w-0">
          <h2 className="text-xs sm:text-base font-extrabold text-slate-900 truncate leading-tight">
            {activeTabTitle}
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-500 font-medium truncate">
            {config?.businessName || 'Ramada & Cabañas Las Brisas'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Estado de conexión */}
        <div
          className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-bold border ${
            isOnline
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-amber-50 text-amber-800 border-amber-300'
          }`}
          title={isOnline ? 'Conectado' : 'Sin conexión'}
        >
          {isOnline ? (
            <>
              <Wifi className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden lg:inline">En línea</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Sin red</span>
            </>
          )}
        </div>

        {/* Botón Pantalla Completa (Modo Kiosco / Tablet) */}
        <button
          type="button"
          onClick={toggleFullscreen}
          className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl touch-press"
          title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
          aria-label={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
        >
          {isFullscreen ? (
            <Minimize2 className="w-4 h-4 text-[#0B3954]" />
          ) : (
            <Maximize2 className="w-4 h-4 text-[#0B3954]" />
          )}
        </button>

        {/* Menú QR */}
        <button
          type="button"
          onClick={onOpenPublicMenu}
          className="px-2.5 sm:px-3 py-1.5 bg-[#0B3954] hover:bg-[#082C42] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 touch-press shadow-xs"
          title="Menú Digital y Reservas"
        >
          <QrCode className="w-4 h-4 text-amber-400" />
          <span className="hidden lg:inline">Menú y Reservas</span>
        </button>

        {/* Ajustes del negocio (solo Admin) */}
        {user.role === 'admin' && (
          <button
            type="button"
            onClick={onOpenSettings}
            className="p-2 sm:px-3 sm:py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 touch-press"
            title="Configuración del negocio"
          >
            <Settings className="w-4 h-4 text-[#0B3954]" />
            <span className="hidden xl:inline">Ajustes</span>
          </button>
        )}

        {/* Perfil del Usuario y Configuración Personal */}
        <button
          type="button"
          onClick={onOpenProfile}
          className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 touch-press"
          title="Mi perfil y cambio de PIN"
        >
          <div className="w-7 h-7 rounded-lg bg-[#0B3954] text-amber-400 font-extrabold text-xs flex items-center justify-center shrink-0">
            {initials}
          </div>
          <div className="hidden sm:block text-left leading-tight">
            <span className="text-xs font-bold text-slate-900 block max-w-[110px] truncate">
              {user.name.split(' ')[0]}
            </span>
            <span className="text-[10px] font-semibold text-slate-500 block">
              {ROLE_LABELS[user.role]}
            </span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
        </button>
      </div>
    </header>
  );
};
