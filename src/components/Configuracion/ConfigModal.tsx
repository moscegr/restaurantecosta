import React, { useState } from 'react';
import { X, Save, RefreshCw, Compass } from 'lucide-react';
import type { BusinessConfig } from '../../types';
import { db } from '../../db/db';
import { initDatabaseWithSeedData } from '../../db/seedData';

interface ConfigModalProps {
  config: BusinessConfig | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({
  config,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  const [businessName, setBusinessName] = useState(config?.businessName || '');
  const [tagline, setTagline] = useState(config?.tagline || '');
  const [ownerName, setOwnerName] = useState(config?.ownerName || '');
  const [phone, setPhone] = useState(config?.phone || '');
  const [whatsapp, setWhatsapp] = useState(config?.whatsapp || '');
  const [address, setAddress] = useState(config?.address || '');
  const [municipio, setMunicipio] = useState<'Copala' | 'Marquelia'>(config?.municipio || 'Copala');
  const [rfc, setRfc] = useState(config?.rfc || '');
  const [wifiName, setWifiName] = useState(config?.wifiName || '');
  const [wifiPassword, setWifiPassword] = useState(config?.wifiPassword || '');
  const [isResetting, setIsResetting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated: BusinessConfig = {
      id: config?.id || 1,
      businessName,
      tagline,
      ownerName,
      phone,
      whatsapp,
      address,
      municipio,
      state: 'Guerrero',
      rfc,
      wifiName,
      wifiPassword,
      currency: 'MXN',
    };

    if (config?.id) {
      await db.businessConfig.update(config.id, updated);
    } else {
      await db.businessConfig.add(updated);
    }

    onSave();
    onClose();
  };

  const handleResetData = async () => {
    if (window.confirm('¿Deseas recargar los datos demo de prueba de la Costa Chica? Esto restablecerá productos, cuartos y el historial para la IA.')) {
      setIsResetting(true);
      await initDatabaseWithSeedData(true);
      setIsResetting(false);
      onSave();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-cyan-950 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-6 h-6 text-amber-400" />
            <div>
              <h3 className="text-lg font-black leading-tight">
                Configuración del Negocio
              </h3>
              <p className="text-xs text-teal-200">
                Datos de tu ramada, restaurante o posada en la Costa Chica
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 text-xs sm:text-sm">
          {/* Nombre y Dueño */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Nombre del Negocio *
              </label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-600"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Propietario / Familia *
              </label>
              <input
                type="text"
                required
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="Ej. Familia Rodríguez o Don Juan"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-600"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Slogan / Subtítulo
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Ej. Sabor Costeño Frente al Mar"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-600"
            />
          </div>

          {/* Municipio y Dirección */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Municipio (Guerrero) *
              </label>
              <select
                value={municipio}
                onChange={(e) => setMunicipio(e.target.value as 'Copala' | 'Marquelia')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-600"
              >
                <option value="Copala">Copala</option>
                <option value="Marquelia">Marquelia</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                RFC (para RESICO / SAT)
              </label>
              <input
                type="text"
                value={rfc}
                onChange={(e) => setRfc(e.target.value.toUpperCase())}
                placeholder="ROSR780512AB3"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-600 uppercase"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Dirección / Playa
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Playa Ventura, Zona de Ramadas #14"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-600"
            />
          </div>

          {/* Teléfonos & WhatsApp */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Teléfono de Contacto
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-600"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                WhatsApp (para pedidos y reservas)
              </label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="527411234567"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-600"
              />
            </div>
          </div>

          {/* WiFi para comensales */}
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
            <span className="font-extrabold text-slate-700 block text-xs">
              Red WiFi del Negocio (Visible en menú comensal)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Nombre Red WiFi"
                value={wifiName}
                onChange={(e) => setWifiName(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
              />
              <input
                type="text"
                placeholder="Contraseña WiFi"
                value={wifiPassword}
                onChange={(e) => setWifiPassword(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>

          {/* Botón de Recargar Datos Demo del Protocolo */}
          <div className="pt-2">
            <button
              type="button"
              disabled={isResetting}
              onClick={handleResetData}
              className="w-full py-2.5 px-3 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl text-amber-900 font-bold text-xs flex items-center justify-center gap-1.5 touch-press"
            >
              <RefreshCw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
              <span>Restablecer Datos Demo del Protocolo Costa Chica</span>
            </button>
          </div>

          {/* Créditos de Investigación */}
          <div className="text-[10px] text-slate-400 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-normal text-center">
            <strong>Timón Costa Chica</strong> · Prototipo de Desarrollo de Software con IA Ligera.
            Investigadora: Yammel Anilú Martínez Saavedra · Copala y Marquelia, Guerrero (2026-2027).
          </div>

          {/* Botones de acción */}
          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-200 hover:bg-slate-300 font-bold text-slate-700 rounded-xl"
            >
              Cerrar
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-cyan-800 hover:bg-cyan-900 active:bg-cyan-950 text-white font-black rounded-xl shadow-md flex items-center justify-center gap-1.5 touch-press"
            >
              <Save className="w-4 h-4 text-amber-300" />
              <span>Guardar Cambios</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
