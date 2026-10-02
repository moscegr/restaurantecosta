import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, QrCode, Settings, Palmtree } from 'lucide-react';
import type { BusinessConfig } from '../types';

interface NavbarProps {
  config: BusinessConfig | null;
  activeTabTitle?: string;
  onOpenPublicMenu: () => void;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  config, 
  activeTabTitle = 'Panel de Control',
  onOpenPublicMenu, 
  onOpenSettings 
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

  return (
    <header className="bg-white text-slate-800 shadow-xs border-b border-slate-200 px-3 sm:px-5 py-2.5 flex items-center justify-between select-none z-20 shrink-0">
      {/* Sección Izquierda: Nombre del establecimiento y vista actual (SIN DUPLICADOS) */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center shrink-0">
          <Palmtree className="w-4.5 h-4.5 text-teal-700" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-xs sm:text-sm font-black text-slate-900 truncate tracking-tight m-0">
              {config?.businessName || 'Ramada & Cabañas Las Brisas'}
            </h2>
            <span className="hidden md:inline text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200">
              {config?.municipio || 'Copala'}, Gro.
            </span>
          </div>
          <p className="text-[11px] text-cyan-800 font-extrabold truncate">
            {activeTabTitle}
          </p>
        </div>
      </div>

      {/* Indicador de Conexión & Botones de Acción */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* Badge Offline-First */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
            isOnline
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse'
          }`}
          title={isOnline ? 'Conectado a Internet' : 'Modo Sin Conexión activo. Los datos se guardan en tu tablet.'}
        >
          <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
          {isOnline ? (
            <span className="flex items-center gap-1 font-bold">
              <Wifi className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">En línea</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 font-bold">
              <WifiOff className="w-3.5 h-3.5 text-amber-600" />
              <span>Sin conexión</span>
            </span>
          )}
        </div>

        {/* Botón Ver Menú Público QR */}
        <button
          onClick={onOpenPublicMenu}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-800 hover:bg-cyan-900 active:bg-cyan-950 text-white rounded-xl text-xs font-bold shadow-xs transition-all touch-press"
          title="Ver Menú Digital del Cliente y Código QR"
        >
          <QrCode className="w-3.5 h-3.5 text-amber-300" />
          <span className="hidden md:inline">Menú QR</span>
        </button>

        {/* Botón Configuración */}
        <button
          onClick={onOpenSettings}
          className="p-1.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-xl text-slate-700 border border-slate-200 transition-all touch-press"
          title="Configuración del Negocio y Datos Demo"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
