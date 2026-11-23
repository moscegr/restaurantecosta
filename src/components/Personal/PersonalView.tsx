import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  ShieldCheck,
  Calculator,
  UtensilsCrossed,
  ChefHat,
  BedDouble,
  Trash2,
  KeyRound,
  Check,
  X,
  Edit3,
} from 'lucide-react';
import { api } from '../../services/api';
import type { StaffUser, UserRole } from '../../types';

const ROLE_OPTIONS: Array<{
  value: UserRole;
  label: string;
  desc: string;
  icon: React.FC<{ className?: string }>;
}> = [
  { value: 'admin', label: 'Administrador', desc: 'Acceso total, reportes, roles y configuración', icon: ShieldCheck },
  { value: 'cajero', label: 'Cajero POS', desc: 'Cobro POS, cuentas abiertas, cortes y gastos', icon: Calculator },
  { value: 'mesero', label: 'Mesero', desc: 'Toma de órdenes por mesa y seguimiento cocina', icon: UtensilsCrossed },
  { value: 'cocina', label: 'Cocina / KDS', desc: 'Pantalla de comandas y control de existencias', icon: ChefHat },
  { value: 'recepcion', label: 'Recepción', desc: 'Gestión de cuartos, cabañas y reservaciones', icon: BedDouble },
];

export const PersonalView: React.FC = () => {
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<StaffUser | null>(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('mesero');
  const [pin, setPin] = useState('');
  const [shift, setShift] = useState('Matutino / Vespertino');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const openCreateModal = () => {
    setEditingUser(null);
    setName('');
    setRole('mesero');
    setPin('');
    setShift('Matutino / Vespertino');
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (u: StaffUser) => {
    setEditingUser(u);
    setName(u.name);
    setRole(u.role);
    setPin('');
    setShift(u.shift || 'General');
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser && !/^\d{4}$/.test(pin)) {
      setError('El PIN debe ser exactamente de 4 números.');
      return;
    }
    if (editingUser && pin && !/^\d{4}$/.test(pin)) {
      setError('Si cambias el PIN, debe ser exactamente de 4 números.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      if (editingUser) {
        await api.updateUser(editingUser.id, {
          name: name.trim(),
          role,
          shift: shift.trim(),
          ...(pin ? { pin } : {}),
        });
      } else {
        await api.createUser({ name: name.trim(), role, pin, shift: shift.trim() });
      }
      setIsModalOpen(false);
      await loadUsers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (u: StaffUser) => {
    try {
      await api.updateUser(u.id, { active: !u.active });
      await loadUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (u: StaffUser) => {
    if (!window.confirm(`¿Eliminar definitivamente a ${u.name}?`)) return;
    try {
      await api.deleteUser(u.id);
      await loadUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-5xl mx-auto w-full space-y-5 pb-16">
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Personal y Control de Roles</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Crea, edita, cambia el PIN táctil o ajusta permisos operativos de cada colaborador.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="px-4 py-3 bg-[#0B3954] hover:bg-[#082C42] text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm touch-press"
        >
          <UserPlus className="w-4 h-4 text-amber-400" />
          <span>Nuevo Colaborador</span>
        </button>
      </div>

      {/* Matriz de Roles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((u) => {
          const meta = ROLE_OPTIONS.find((r) => r.value === u.role) || ROLE_OPTIONS[2];
          const Icon = meta.icon;

          return (
            <div
              key={u.id}
              className={`bg-white rounded-2xl p-4 border shadow-xs flex flex-col justify-between gap-4 ${
                u.active ? 'border-slate-200' : 'border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-slate-100 text-[#0B3954] flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{u.name}</h3>
                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-sky-50 text-[#0B3954] border border-sky-200">
                      {meta.label}
                    </span>
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    u.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {u.active ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              <div className="text-xs text-slate-500 space-y-1">
                <p className="font-medium text-slate-700">Área / Turno: {u.shift}</p>
                <p>{meta.desc}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => openEditModal(u)}
                    className="px-3 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-[#0B3954] border border-sky-200 text-xs font-bold flex items-center gap-1 touch-press"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Editar / PIN</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleActive(u)}
                    className="px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 touch-press"
                  >
                    {u.active ? 'Desactivar' : 'Activar'}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(u)}
                  className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 touch-press"
                  title="Eliminar colaborador"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Crear / Editar Colaborador */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-[#0B3954] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <KeyRound className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-base">
                  {editingUser ? 'Editar Colaborador y PIN' : 'Registrar Colaborador'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-sm">
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nombre completo
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Javier Hernández"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-[#087E8B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Rol asignado
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-[#087E8B]"
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label} — {r.desc}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {editingUser ? 'Nuevo PIN (opcional)' : 'PIN de acceso (4 dígitos)'}
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    required={!editingUser}
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder={editingUser ? 'Dejar vacío' : '0000'}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-lg font-extrabold tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-[#087E8B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Turno / Estación
                  </label>
                  <input
                    type="text"
                    value={shift}
                    onChange={(e) => setShift(e.target.value)}
                    placeholder="Ej. Zona Playa"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-[#087E8B]"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-[#0B3954] hover:bg-[#082C42] text-white font-bold text-xs flex items-center justify-center gap-1.5 touch-press"
                >
                  <Check className="w-4 h-4 text-amber-400" />
                  <span>{saving ? 'Guardando...' : editingUser ? 'Guardar Cambios' : 'Crear Usuario'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
