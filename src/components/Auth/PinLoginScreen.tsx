import React, { useState, useEffect } from 'react';
import {
  Compass,
  Delete,
  ShieldCheck,
  Calculator,
  UtensilsCrossed,
  ChefHat,
  BedDouble,
  Lock,
  QrCode,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { api, saveSession } from '../../services/api';
import type { BusinessConfig, StaffUser, UserRole } from '../../types';

interface PinLoginScreenProps {
  config: BusinessConfig | null;
  onLoginSuccess: (user: StaffUser) => void;
  onOpenPublicMenu: () => void;
}

const ROLE_META: Record<
  UserRole,
  { label: string; icon: React.FC<{ className?: string }>; badgeClass: string; demoPin: string }
> = {
  admin: {
    label: 'Administrador',
    icon: ShieldCheck,
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-200',
    demoPin: '1234',
  },
  cajero: {
    label: 'Cajero POS',
    icon: Calculator,
    badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-200',
    demoPin: '2222',
  },
  mesero: {
    label: 'Mesero',
    icon: UtensilsCrossed,
    badgeClass: 'bg-sky-100 text-sky-900 border-sky-200',
    demoPin: '3333',
  },
  cocina: {
    label: 'Cocina / KDS',
    icon: ChefHat,
    badgeClass: 'bg-orange-100 text-orange-900 border-orange-200',
    demoPin: '4444',
  },
  recepcion: {
    label: 'Recepción',
    icon: BedDouble,
    badgeClass: 'bg-indigo-100 text-indigo-900 border-indigo-200',
    demoPin: '5555',
  },
};

export const PinLoginScreen: React.FC<PinLoginScreenProps> = ({
  config,
  onLoginSuccess,
  onOpenPublicMenu,
}) => {
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<StaffUser | null>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .getStaffList()
      .then((list) => {
        setStaff(list);
        if (list.length > 0) setSelectedUser(list[0]);
      })
      .catch((err) => setError(err.message || 'No se pudo conectar con el servidor MongoDB.'))
      .finally(() => setLoading(false));
  }, []);

  const submitPin = async (userObj: StaffUser, enteredPin: string) => {
    try {
      setSubmitting(true);
      setError('');
      const res = await api.loginWithPin(userObj.id, enteredPin);
      saveSession(res.token, res.user);
      onLoginSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'PIN incorrecto.');
      setPin('');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDigit = (digit: string) => {
    if (!selectedUser || submitting) return;
    setError('');
    if (pin.length >= 4) return;
    const nextPin = pin + digit;
    setPin(nextPin);
    if (nextPin.length === 4) {
      submitPin(selectedUser, nextPin);
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError('');
  };

  const handleClear = () => {
    setPin('');
    setError('');
  };

  return (
    <div className="h-[100dvh] w-full bg-[#072436] overflow-y-auto overscroll-contain">
      <div className="min-h-full w-full flex items-center justify-center p-3 sm:p-6">
        <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 border border-slate-200/20 my-auto">
        {/* Panel Izquierdo: Identidad y Selección de Personal */}
        <div className="lg:col-span-7 bg-[#F8FAFC] p-6 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-200">
          <div>
            <div className="flex items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#0B3954] text-amber-400 flex items-center justify-center shadow-md">
                  <Compass className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                    Timón Costa Chica
                  </h1>
                  <p className="text-xs font-medium text-slate-500">
                    {config?.businessName || 'Ramada & Cabañas Las Brisas'} · {config?.municipio || 'Copala'}, Guerrero
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onOpenPublicMenu}
                className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-[#087E8B] text-slate-700 hover:text-[#0B3954] text-xs font-bold flex items-center gap-1.5 shadow-xs touch-press"
              >
                <QrCode className="w-4 h-4 text-[#087E8B]" />
                <span>Menú Público</span>
              </button>
            </div>

            <div className="mb-4">
              <h2 className="text-base font-bold text-slate-800">Selecciona tu perfil de acceso</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Cada colaborador accede únicamente a los módulos autorizados para su rol.
              </p>
            </div>

            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                <Loader2 className="w-7 h-7 animate-spin text-[#087E8B]" />
                <span className="text-xs font-medium">Cargando perfiles del sistema...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                {staff.map((member) => {
                  const meta = ROLE_META[member.role] || ROLE_META.mesero;
                  const RoleIcon = meta.icon;
                  const isSelected = selectedUser?.id === member.id;

                  return (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => {
                        setSelectedUser(member);
                        setPin('');
                        setError('');
                      }}
                      className={`p-3.5 rounded-2xl border-2 text-left transition-all touch-press flex items-start gap-3 ${
                        isSelected
                          ? 'bg-white border-[#0B3954] shadow-md ring-2 ring-[#0B3954]/10'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-[#0B3954] text-amber-400' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <RoleIcon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-sm text-slate-900 truncate">{member.name}</p>
                        <span
                          className={`inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${meta.badgeClass}`}
                        >
                          {meta.label}
                        </span>
                        <p className="text-[11px] text-slate-400 mt-1 truncate">{member.shift}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200">
            <p className="text-[11px] font-medium text-slate-400">
              Acceso protegido por PIN personal. Si olvidaste tu clave, solicítala al administrador.
            </p>
          </div>
        </div>

        {/* Panel Derecho: Teclado Táctil de PIN */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 flex flex-col justify-center">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-[#0B3954] flex items-center justify-center mx-auto mb-3">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">
              {selectedUser ? selectedUser.name : 'Ingresa tu PIN'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {selectedUser
                ? `Ingresa tu clave de 4 dígitos (${ROLE_META[selectedUser.role]?.label})`
                : 'Selecciona un usuario a la izquierda'}
            </p>

            {/* Indicadores de 4 dígitos */}
            <div className="flex items-center justify-center gap-3.5 mt-5">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`w-4 h-4 rounded-full border-2 transition-all ${
                    pin.length > idx
                      ? 'bg-[#0B3954] border-[#0B3954] scale-110'
                      : 'bg-slate-100 border-slate-300'
                  }`}
                />
              ))}
            </div>

            {error && (
              <div className="mt-4 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center justify-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Teclado Numérico Táctil Grande */}
          <div className="grid grid-cols-3 gap-2.5 max-w-[280px] mx-auto w-full">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
              <button
                key={d}
                type="button"
                disabled={!selectedUser || submitting}
                onClick={() => handleDigit(d)}
                className="h-14 sm:h-16 rounded-2xl bg-slate-50 hover:bg-slate-100 active:bg-[#0B3954] active:text-white border border-slate-200 text-xl font-extrabold text-slate-800 shadow-xs touch-press disabled:opacity-40"
              >
                {d}
              </button>
            ))}
            <button
              type="button"
              onClick={handleClear}
              className="h-14 sm:h-16 rounded-2xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-600 touch-press"
            >
              Limpiar
            </button>
            <button
              type="button"
              disabled={!selectedUser || submitting}
              onClick={() => handleDigit('0')}
              className="h-14 sm:h-16 rounded-2xl bg-slate-50 hover:bg-slate-100 active:bg-[#0B3954] active:text-white border border-slate-200 text-xl font-extrabold text-slate-800 shadow-xs touch-press disabled:opacity-40"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="h-14 sm:h-16 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 flex items-center justify-center touch-press border border-rose-100"
              aria-label="Borrar último dígito"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};
