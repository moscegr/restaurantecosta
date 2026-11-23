import React, { useState, useEffect } from 'react';
import { X, Save, User, KeyRound, LogOut, Settings, CheckCircle2 } from 'lucide-react';
import { api, saveSession } from '../../services/api';
import type { StaffUser, UserRole } from '../../types';

interface ProfileModalProps {
  user: StaffUser;
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated: (updated: StaffUser) => void;
  onOpenBusinessSettings?: () => void;
  onLogout: () => void;
}

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrador',
  cajero: 'Cajero POS',
  mesero: 'Mesero',
  cocina: 'Cocina / KDS',
  recepcion: 'Recepción',
};

export const ProfileModal: React.FC<ProfileModalProps> = ({
  user,
  isOpen,
  onClose,
  onProfileUpdated,
  onOpenBusinessSettings,
  onLogout,
}) => {
  const [name, setName] = useState(user.name);
  const [shift, setShift] = useState(user.shift || '');
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName(user.name);
      setShift(user.shift || '');
      setCurrentPin('');
      setNewPin('');
      setError('');
      setSuccess('');
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPin && !/^\d{4}$/.test(newPin)) {
      setError('El nuevo PIN debe ser de 4 dígitos numéricos.');
      return;
    }

    try {
      setSaving(true);
      const res = await api.updateMyProfile({
        name: name.trim(),
        shift: shift.trim(),
        ...(newPin ? { currentPin, newPin } : {}),
      });
      saveSession(res.token, res.user);
      onProfileUpdated(res.user);
      setSuccess('Perfil actualizado correctamente.');
      setCurrentPin('');
      setNewPin('');
      setTimeout(() => onClose(), 700);
    } catch (err: any) {
      setError(err.message || 'No se pudo actualizar el perfil.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200">
        {/* Header Perfil */}
        <div className="bg-[#0B3954] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-400 text-[#0B3954] font-extrabold text-base flex items-center justify-center shadow">
              {initials}
            </div>
            <div>
              <h3 className="text-base font-extrabold leading-tight">Mi Perfil y Seguridad</h3>
              <p className="text-xs text-sky-200">{ROLE_LABELS[user.role]}</p>
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
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{success}</span>
            </div>
          )}

          <div>
            <label className="font-bold text-slate-700 flex items-center gap-1.5 mb-1">
              <User className="w-3.5 h-3.5 text-[#087E8B]" />
              <span>Nombre</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-[#087E8B]"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Área / Turno</label>
            <input
              type="text"
              value={shift}
              onChange={(e) => setShift(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#087E8B]"
            />
          </div>

          {/* Cambio de PIN personal */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3">
            <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-[#0B3954]" />
              <span>Cambiar mi PIN de acceso (Opcional)</span>
            </span>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">PIN Actual</label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="••••"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono text-center font-extrabold tracking-widest"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Nuevo PIN</label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="••••"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono text-center font-extrabold tracking-widest"
                />
              </div>
            </div>
          </div>

          {user.role === 'admin' && onOpenBusinessSettings && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenBusinessSettings();
              }}
              className="w-full py-2.5 px-3.5 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-[#0B3954] text-xs font-bold flex items-center justify-center gap-2 touch-press"
            >
              <Settings className="w-4 h-4" />
              <span>Configuración del Establecimiento y RESICO</span>
            </button>
          )}

          <div className="pt-1 flex gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="px-4 py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs flex items-center gap-1.5 touch-press"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Turno</span>
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 bg-[#0B3954] hover:bg-[#082C42] text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 touch-press"
            >
              <Save className="w-4 h-4 text-amber-400" />
              <span>{saving ? 'Guardando...' : 'Guardar Perfil'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
