import React, { useState, useEffect } from 'react';
import { Compass, Wifi, WifiOff, QrCode, Settings } from 'lucide-react';
import type { BusinessConfig } from '../types';

interface NavbarProps {
  config: BusinessConfig | null;
  onOpenPublicMenu: () => void;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ config, onOpenPublicMenu, onOpenSettings }) => {
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

  return (
    <header className="bg-gradient-to-r from-cyan-800 via-teal-700 to-cyan-900 text-white shadow-md border-b border-teal-600/30 px-3 sm:px-5 py-2.5 flex items-center justify-between select-none z-30">
      {/* Logo e Identidad */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-400 text-cyan-950 flex items-center justify-center shadow-lg font-black text-xl border-2 border-amber-300 transform active:scale-95 transition-transform">
          <Compass className="w-6 h-6 text-cyan-900 animate-spin-slow" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-base sm:text-lg font-black tracking-tight leading-tight text-white m-0">
              Timón <span className="text-amber-300 font-extrabold text-xs sm:text-sm tracking-wider uppercase">Costa Chica</span>
            </h1>
          </div>
          <p className="text-xs sm:text-xs text-teal-100 font-medium truncate max-w-[190px] sm:max-w-[280px]">
            {config?.businessName || 'Ramada & Cabañas Las Brisas'} · <span className="text-amber-200">{config?.municipio || 'Copala'}</span>
          </p>
        </div>
      </div>

      {/* Indicador de Conexión & Botones de Acción */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Badge Offline-First (Slide 11 & 22) */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shadow-inner border ${
            isOnline
              ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40'
              : 'bg-amber-500/20 text-amber-200 border-amber-400/40 animate-pulse'
          }`}
          title={isOnline ? 'Conectado a Internet' : 'Modo Sin Conexión activo. Los datos se guardan en tu tablet.'}
        >
          <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
          {isOnline ? (
            <span className="flex items-center gap-1">
              <Wifi className="w-3.5 h-3.5" /> En línea
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <WifiOff className="w-3.5 h-3.5" /> Sin conexión
            </span>
          )}
        </div>

        {/* Botón Ver Menú Público QR */}
        <button
          onClick={onOpenPublicMenu}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow border border-teal-400/30 transition-all touch-press"
          title="Ver Menú Digital del Cliente y Código QR"
        >
          <QrCode className="w-4 h-4 text-amber-300" />
          <span className="hidden md:inline">Menú QR</span>
        </button>

        {/* Botón Configuración */}
        <button
          onClick={onOpenSettings}
          className="p-2 bg-cyan-950/40 hover:bg-cyan-950/60 active:bg-cyan-950 rounded-lg text-teal-200 hover:text-white border border-teal-500/20 transition-all touch-press"
          title="Configuración del Negocio y Datos Demo"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
