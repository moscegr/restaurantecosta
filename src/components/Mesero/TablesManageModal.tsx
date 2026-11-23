import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Edit3, Check, MapPin } from 'lucide-react';
import { api } from '../../services/api';

interface TablesManageModalProps {
  tables: string[];
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const TablesManageModal: React.FC<TablesManageModalProps> = ({
  tables,
  isOpen,
  onClose,
  onSaved,
}) => {
  const [list, setList] = useState<string[]>(tables);
  const [newTableName, setNewTableName] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setList(tables);
      setNewTableName('');
      setEditingIndex(null);
    }
  }, [isOpen, tables]);

  if (!isOpen) return null;

  const persistTables = async (updatedList: string[]) => {
    try {
      setSaving(true);
      await api.updateConfig({ tables: updatedList });
      setList(updatedList);
      onSaved();
    } catch (err: any) {
      alert(err.message || 'Error guardando mesas/enramadas.');
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newTableName.trim();
    if (!trimmed) return;
    if (list.includes(trimmed)) {
      alert('Ya existe una mesa o enramada con ese nombre.');
      return;
    }
    setNewTableName('');
    await persistTables([...list, trimmed]);
  };

  const handleSaveEdit = async (idx: number) => {
    const trimmed = editingValue.trim();
    if (!trimmed) return;
    const copy = [...list];
    copy[idx] = trimmed;
    setEditingIndex(null);
    await persistTables(copy);
  };

  const handleDelete = async (idx: number) => {
    const target = list[idx];
    if (!window.confirm(`¿Eliminar "${target}"?`)) return;
    const copy = list.filter((_, i) => i !== idx);
    await persistTables(copy);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200">
        <div className="bg-[#0B3954] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <MapPin className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-base font-extrabold">Gestionar Mesas y Enramadas</h3>
              <p className="text-xs text-sky-200">
                Agrega, renombra o elimina zonas de servicio del restaurante.
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

        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Agregar nueva */}
          <form onSubmit={handleAdd} className="flex gap-2">
            <input
              type="text"
              placeholder="Ej. Enramada 6 (Playa) o Mesa 5 (Terraza)"
              value={newTableName}
              onChange={(e) => setNewTableName(e.target.value)}
              className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#087E8B]"
            />
            <button
              type="submit"
              disabled={saving || !newTableName.trim()}
              className="px-4 py-2.5 bg-[#0B3954] hover:bg-[#082C42] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 touch-press disabled:opacity-50"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Agregar</span>
            </button>
          </form>

          {/* Lista editable */}
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
            {list.map((name, idx) => (
              <div
                key={`${name}-${idx}`}
                className="px-3.5 py-2.5 bg-white flex items-center justify-between gap-2"
              >
                {editingIndex === idx ? (
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="text"
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-[#087E8B] rounded-lg text-xs font-bold"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(idx)}
                      className="p-2 rounded-lg bg-emerald-600 text-white touch-press"
                      title="Guardar nombre"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingIndex(null)}
                      className="p-2 rounded-lg bg-slate-100 text-slate-600 touch-press"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="text-xs sm:text-sm font-bold text-slate-800">{name}</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingIndex(idx);
                          setEditingValue(name);
                        }}
                        className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 touch-press"
                        title="Renombrar"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(idx)}
                        className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 touch-press"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-[#0B3954] text-white font-bold text-xs rounded-xl touch-press"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};
