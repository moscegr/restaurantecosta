import React, { useState, useEffect } from 'react';
import { BedDouble, Sparkles, User, Calendar, Users } from 'lucide-react';
import type { Room, RoomStatus } from '../../types';
import { api } from '../../services/api';
import { RoomModal } from './RoomModal';

export const CuartosView: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'todos' | RoomStatus>('todos');

  const loadRooms = async () => {
    try {
      const list = await api.getRooms();
      setRooms(list);
    } catch (err) {
      console.error('Error cargando habitaciones:', err);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const total = rooms.length;
  const libres = rooms.filter((r) => r.status === 'libre').length;
  const ocupadas = rooms.filter((r) => r.status === 'ocupada').length;
  const limpieza = rooms.filter((r) => r.status === 'limpieza').length;
  const reservadas = rooms.filter((r) => r.status === 'reservada').length;

  const filteredRooms = rooms.filter((r) => filterStatus === 'todos' || r.status === filterStatus);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-5 pb-16">
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">
              Tablero de Hospedaje y Cabañas
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              <span className="font-bold text-[#0B3954]">{ocupadas} ocupadas</span> de {total}{' '}
              unidades totales. Toca cualquier unidad para gestionar entrada, salida o limpieza.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: 'todos', label: `Todas (${total})`, activeCls: 'bg-slate-900 text-white' },
              { id: 'libre', label: `Libres (${libres})`, activeCls: 'bg-emerald-600 text-white' },
              { id: 'ocupada', label: `Ocupadas (${ocupadas})`, activeCls: 'bg-[#0B3954] text-white' },
              { id: 'limpieza', label: `Limpieza (${limpieza})`, activeCls: 'bg-amber-500 text-slate-950' },
              { id: 'reservada', label: `Reservadas (${reservadas})`, activeCls: 'bg-indigo-600 text-white' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold touch-press ${
                filterStatus === tab.id
                  ? tab.activeCls
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Fotográfico de Cabañas y Cuartos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredRooms.map((room) => {
          const badgeStyle =
            room.status === 'libre'
              ? 'bg-emerald-600 text-white'
              : room.status === 'ocupada'
              ? 'bg-[#0B3954] text-amber-300'
              : room.status === 'limpieza'
              ? 'bg-amber-400 text-slate-950'
              : 'bg-indigo-600 text-white';

          return (
            <button
              key={room.id}
              type="button"
              onClick={() => {
                setSelectedRoom(room);
                setIsModalOpen(true);
              }}
              className="bg-white rounded-2xl border border-slate-200 hover:border-[#087E8B] shadow-xs hover:shadow-md overflow-hidden text-left flex flex-col justify-between touch-press"
            >
              <div className="relative h-32 w-full bg-slate-100">
                {room.imageUrl ? (
                  <img
                    src={room.imageUrl}
                    alt={room.name}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <BedDouble className="w-10 h-10" />
                  </div>
                )}
                <span className="absolute top-2.5 left-2.5 w-8 h-8 rounded-xl bg-slate-900/80 text-white text-sm font-extrabold flex items-center justify-center backdrop-blur-xs">
                  {room.number}
                </span>
                <span
                  className={`absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase ${badgeStyle}`}
                >
                  {room.status}
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">{room.name}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <span>{room.type}</span> ·
                    <Users className="w-3.5 h-3.5" />
                    <span>{room.capacity} pers.</span>
                  </p>

                  {room.status === 'ocupada' && room.guestName && (
                    <p className="mt-2 text-xs font-bold text-[#0B3954] bg-sky-50 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 truncate">
                      <User className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{room.guestName}</span>
                    </p>
                  )}

                  {room.status === 'reservada' && room.guestName && (
                    <p className="mt-2 text-xs font-bold text-indigo-800 bg-indigo-50 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 truncate">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{room.guestName}</span>
                    </p>
                  )}

                  {room.status === 'limpieza' && (
                    <p className="mt-2 text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      <span>Pendiente de limpieza</span>
                    </p>
                  )}
                </div>

                <div className="pt-2.5 border-t border-slate-100 flex items-baseline justify-between">
                  <span className="text-base font-extrabold text-slate-900">
                    ${room.pricePerNight}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400">MXN / noche</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <RoomModal
        room={selectedRoom}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdate={loadRooms}
      />
    </div>
  );
};
