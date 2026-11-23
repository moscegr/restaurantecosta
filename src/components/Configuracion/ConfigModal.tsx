import React, { useState, useEffect } from 'react';
import { X, Save, RefreshCw, Compass, CheckCircle2 } from 'lucide-react';
import type { BusinessConfig } from '../../types';
import { api } from '../../services/api';

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
  const [businessName, setBusinessName] = useState('');
  const [tagline, setTagline] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [address, setAddress] = useState('');
  const [municipio, setMunicipio] = useState<'Copala' | 'Marquelia'>('Copala');
  const [rfc, setRfc] = useState('');
  const [taxRegime, setTaxRegime] = useState('626 - Régimen Simplificado de Confianza (RESICO)');
  const [thermalPaperWidth, setThermalPaperWidth] = useState<'58mm' | '80mm'>('80mm');
  const [wifiName, setWifiName] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSavedMsg('');
      setErrorMsg('');
      if (config) {
        setBusinessName(config.businessName || '');
        setTagline(config.tagline || '');
        setOwnerName(config.ownerName || '');
        setPhone(config.phone || '');
        setWhatsapp(config.whatsapp || '');
        setAddress(config.address || '');
        setMunicipio(config.municipio || 'Copala');
        setRfc(config.rfc || '');
        setTaxRegime(config.taxRegime || '626 - Régimen Simplificado de Confianza (RESICO)');
        setThermalPaperWidth(config.thermalPaperWidth || '80mm');
        setWifiName(config.wifiName || '');
        setWifiPassword(config.wifiPassword || '');
      }
    }
  }, [config, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setErrorMsg('');
      await api.updateConfig({
        businessName: businessName.trim(),
        tagline: tagline.trim(),
        ownerName: ownerName.trim(),
        phone: phone.trim(),
        whatsapp: whatsapp.trim(),
        address: address.trim(),
        municipio,
        state: 'Guerrero',
        rfc: rfc.trim().toUpperCase(),
        taxRegime: taxRegime.trim(),
        thermalPaperWidth,
        wifiName: wifiName.trim(),
        wifiPassword: wifiPassword.trim(),
        currency: 'MXN',
      });
      setSavedMsg('Configuración guardada correctamente.');
      onSave();
      setTimeout(() => {
        onClose();
      }, 600);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error guardando configuración.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetData = async () => {
    if (
      !window.confirm(
        '¿Restablecer la base de datos MongoDB con los datos comerciales de demostración?'
      )
    )
      return;
    try {
      setIsResetting(true);
      await api.resetSeed();
      onSave();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error restableciendo base de datos.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-3">
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200">
        <div className="bg-[#0B3954] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Compass className="w-6 h-6 text-amber-400" />
            <div>
              <h3 className="text-base font-extrabold">Configuración del Establecimiento</h3>
              <p className="text-xs text-sky-200">
                Datos del restaurante, facturación RESICO, impresora térmica y WhatsApp
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs sm:text-sm">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {errorMsg}
            </div>
          )}
          {savedMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{savedMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Nombre del Negocio *</label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-[#087E8B]"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Propietario / Razón Social</label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#087E8B]"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Eslogan / Subtítulo del Menú</label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Ej. Cocina Costeña Frente al Mar · Playa Ventura"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#087E8B]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Teléfono Visible</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="741 123 4567"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#087E8B]"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">WhatsApp Pedidos (con 52)</label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="527411234567"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#087E8B]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Municipio</label>
              <select
                value={municipio}
                onChange={(e) => setMunicipio(e.target.value as 'Copala' | 'Marquelia')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              >
                <option value="Copala">Copala, Guerrero</option>
                <option value="Marquelia">Marquelia, Guerrero</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Ancho Impresora Térmica</label>
              <select
                value={thermalPaperWidth}
                onChange={(e) => setThermalPaperWidth(e.target.value as '58mm' | '80mm')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              >
                <option value="80mm">80mm (Estándar POS)</option>
                <option value="58mm">58mm (Portátil Bluetooth)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">RFC Emisor (SAT)</label>
              <input
                type="text"
                value={rfc}
                onChange={(e) => setRfc(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Régimen Fiscal</label>
              <input
                type="text"
                value={taxRegime}
                onChange={(e) => setTaxRegime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Dirección / Playa</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Red Wi-Fi Clientes</label>
              <input
                type="text"
                value={wifiName}
                onChange={(e) => setWifiName(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Clave Wi-Fi</label>
              <input
                type="text"
                value={wifiPassword}
                onChange={(e) => setWifiPassword(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>

          <button
            type="button"
            disabled={isResetting}
            onClick={handleResetData}
            className="w-full py-2.5 px-3 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl text-amber-950 font-bold text-xs flex items-center justify-center gap-1.5 touch-press"
          >
            <RefreshCw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
            <span>Restablecer Datos de Demostración</span>
          </button>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 rounded-xl text-xs"
            >
              Cerrar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 bg-[#0B3954] hover:bg-[#082C42] text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 touch-press"
            >
              <Save className="w-4 h-4 text-amber-400" />
              <span>{saving ? 'Guardando...' : 'Guardar Cambios'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
