import React, { useState, useEffect } from 'react';
import { X, Save, Image as ImageIcon } from 'lucide-react';
import type { Room, RoomType } from '../../types';
import { api } from '../../services/api';

interface RoomEditModalProps {
  roomToEdit?: Room | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ROOM_TYPES: RoomType[] = [
  'Cabaña Frente al Mar',
  'Familiar',
  'Doble',
  'Sencilla',
];

const PRESET_ROOM_PHOTOS = [
  {
    label: 'Cabaña Playa',
    url: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=700&q=80',
  },
  {
    label: 'Doble',
    url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=700&q=80',
  },
  {
    label: 'Sencilla',
    url: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=700&q=80',
  },
  {
    label: 'Familiar',
    url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=700&q=80',
  },
];

export const RoomEditModal: React.FC<RoomEditModalProps> = ({
  roomToEdit,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [number, setNumber] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<RoomType>('Cabaña Frente al Mar');
  const [pricePerNight, setPricePerNight] = useState<number>(850);
  const [capacity, setCapacity] = useState<number>(4);
  const [imageUrl, setImageUrl] = useState(PRESET_ROOM_PHOTOS[0].url);
  const [amenitiesStr, setAmenitiesStr] = useState('Vista al mar, Hamacas, Wi-Fi');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (roomToEdit) {
        setNumber(roomToEdit.number);
        setName(roomToEdit.name);
        setType(roomToEdit.type);
        setPricePerNight(roomToEdit.pricePerNight);
        setCapacity(roomToEdit.capacity);
        setImageUrl(roomToEdit.imageUrl || PRESET_ROOM_PHOTOS[0].url);
        setAmenitiesStr((roomToEdit.amenities || []).join(', '));
      } else {
        setNumber('');
        setName('');
        setType('Cabaña Frente al Mar');
        setPricePerNight(850);
        setCapacity(4);
        setImageUrl(PRESET_ROOM_PHOTOS[0].url);
        setAmenitiesStr('Vista al mar, Aire acondicionado, Wi-Fi');
      }
    }
  }, [roomToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!number.trim() || !name.trim()) return;

    try {
      setSaving(true);
      const amenities = amenitiesStr
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        number: number.trim(),
        name: name.trim(),
        type,
        pricePerNight: Number(pricePerNight) || 0,
        capacity: Number(capacity) || 2,
        imageUrl: imageUrl.trim(),
        amenities,
      };

      if (roomToEdit) {
        await api.updateRoom(roomToEdit.id, payload);
      } else {
        await api.createRoom({ ...payload, status: 'libre' });
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Error guardando habitación.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200">
        <div className="bg-[#0B3954] text-white p-5 flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold">
              {roomToEdit ? 'Editar Cuarto / Cabaña' : 'Agregar Nuevo Cuarto o Cabaña'}
            </h3>
            <p className="text-xs text-sky-200">
              Se actualiza en el tablero de hospedaje y en el menú público de reservas.
            </p>
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
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Número *</label>
              <input
                type="text"
                required
                placeholder="Ej. 9"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold"
              />
            </div>
            <div className="col-span-2">
              <label className="font-bold text-slate-700 block mb-1">Nombre *</label>
              <input
                type="text"
                required
                placeholder="Ej. Cabaña 9 - Las Peñitas"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="font-bold text-slate-700 block mb-1">Tipo</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as RoomType)}
                className="w-full px-2.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              >
                {ROOM_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Tarifa / Noche ($)</label>
              <input
                type="number"
                min="0"
                required
                value={pricePerNight}
                onChange={(e) => setPricePerNight(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-[#0B3954]"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Capacidad</label>
              <input
                type="number"
                min="1"
                max="15"
                required
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-bold text-slate-700 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-[#087E8B]" />
              <span>Fotografía (galería rápida o URL)</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {PRESET_ROOM_PHOTOS.map((ph) => (
                <button
                  key={ph.label}
                  type="button"
                  onClick={() => setImageUrl(ph.url)}
                  className={`h-14 rounded-xl overflow-hidden border-2 touch-press ${
                    imageUrl === ph.url ? 'border-[#0B3954] ring-2 ring-[#087E8B]/30' : 'border-slate-200'
                  }`}
                  title={ph.label}
                >
                  <img src={ph.url} alt={ph.label} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Amenidades (separadas por coma)
            </label>
            <input
              type="text"
              value={amenitiesStr}
              onChange={(e) => setAmenitiesStr(e.target.value)}
              placeholder="Vista al mar, Hamacas, Aire acondicionado, Wi-Fi"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 rounded-xl text-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 bg-[#0B3954] hover:bg-[#082C42] text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 touch-press"
            >
              <Save className="w-4 h-4 text-amber-400" />
              <span>{saving ? 'Guardando...' : 'Guardar Unidad'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
