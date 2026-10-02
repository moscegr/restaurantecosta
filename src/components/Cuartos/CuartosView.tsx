import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import type { Room, RoomStatus } from '../../types';
import { db } from '../../db/db';
import { RoomModal } from './RoomModal';

export const CuartosView: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'todos' | RoomStatus>('todos');

  const loadRooms = async () => {
    const list = await db.rooms.toArray();
    setRooms(list);
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const handleOpenRoom = (room: Room) => {
    setSelectedRoom(room);
    setIsModalOpen(true);
  };

  // Contadores
  const total = rooms.length;
  const libres = rooms.filter(r => r.status === 'libre').length;
  const ocupadas = rooms.filter(r => r.status === 'ocupada').length;
  const limpieza = rooms.filter(r => r.status === 'limpieza').length;
  const reservadas = rooms.filter(r => r.status === 'reservada').length;

  const filteredRooms = rooms.filter(r => filterStatus === 'todos' || r.status === filterStatus);

  return (
    <div className="flex-1 overflow-y-auto pb-24 p-3 sm:p-5 max-w-5xl mx-auto space-y-4">
      {/* Cabecera del Tablero (Slide 22) */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
              Tus Cuartos & Cabañas Hoy
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              <span className="font-bold text-cyan-800">{ocupadas} ocupados</span> de {total} disponibles en total
            </p>
          </div>

          <div className="text-xs text-slate-500 italic bg-amber-50 border border-amber-200 p-2 rounded-xl">
            💡 Toca un cuarto para registrar entrada, salida, limpieza o reservación.
          </div>
        </div>

        {/* Filtros rápidos con contadores de colores */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pt-2">
          <button
            onClick={() => setFilterStatus('todos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all touch-press ${
              filterStatus === 'todos'
                ? 'bg-slate-800 text-white shadow'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos ({total})
          </button>

          <button
            onClick={() => setFilterStatus('libre')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all touch-press flex items-center gap-1.5 ${
              filterStatus === 'libre'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Libre ({libres})
          </button>

          <button
            onClick={() => setFilterStatus('ocupada')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all touch-press flex items-center gap-1.5 ${
              filterStatus === 'ocupada'
                ? 'bg-cyan-700 text-white shadow'
                : 'bg-cyan-50 text-cyan-800 hover:bg-cyan-100 border border-cyan-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            Ocupada ({ocupadas})
          </button>

          <button
            onClick={() => setFilterStatus('limpieza')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all touch-press flex items-center gap-1.5 ${
              filterStatus === 'limpieza'
                ? 'bg-amber-500 text-cyan-950 shadow font-black'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            Limpieza ({limpieza})
          </button>

          <button
            onClick={() => setFilterStatus('reservada')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all touch-press flex items-center gap-1.5 ${
              filterStatus === 'reservada'
                ? 'bg-purple-600 text-white shadow'
                : 'bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
            Reservada ({reservadas})
          </button>
        </div>
      </div>

      {/* Grid de Cuartos Táctil (Slide 22) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
        {filteredRooms.map((room) => {
          const isOcupada = room.status === 'ocupada';
          const isLibre = room.status === 'libre';
          const isLimpieza = room.status === 'limpieza';
          const isReservada = room.status === 'reservada';

          return (
            <button
              key={room.id}
              onClick={() => handleOpenRoom(room)}
              className={`relative flex flex-col justify-between p-4 rounded-2xl border-2 text-left transition-all touch-press min-h-[145px] shadow-sm hover:shadow-md ${
                isOcupada
                  ? 'bg-gradient-to-br from-cyan-900 to-teal-900 text-white border-cyan-800'
                  : isLibre
                  ? 'bg-emerald-50/60 hover:bg-emerald-50 border-emerald-300 text-slate-800'
                  : isLimpieza
                  ? 'bg-amber-50 hover:bg-amber-100/70 border-amber-300 text-slate-800'
                  : 'bg-purple-50 hover:bg-purple-100/70 border-purple-300 text-slate-800'
              }`}
            >
              {/* Número del cuarto y tipo */}
              <div className="flex items-start justify-between w-full">
                <span
                  className={`text-2xl sm:text-3xl font-black ${
                    isOcupada ? 'text-amber-300' : 'text-slate-900'
                  }`}
                >
                  {room.number}
                </span>

                <span
                  className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    isOcupada
                      ? 'bg-amber-400 text-cyan-950'
                      : isLibre
                      ? 'bg-emerald-200 text-emerald-900'
                      : isLimpieza
                      ? 'bg-amber-200 text-amber-900'
                      : 'bg-purple-200 text-purple-900'
                  }`}
                >
                  {room.status}
                </span>
              </div>

              {/* Contenido / Huésped */}
              <div className="my-2">
                <h4
                  className={`text-xs sm:text-sm font-extrabold line-clamp-1 ${
                    isOcupada ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {room.name}
                </h4>

                {isOcupada && room.guestName && (
                  <p className="text-xs text-amber-200 font-semibold truncate mt-0.5">
                    👤 {room.guestName}
                  </p>
                )}

                {isReservada && room.guestName && (
                  <p className="text-xs text-purple-800 font-semibold truncate mt-0.5">
                    🗓️ {room.guestName}
                  </p>
                )}

                {isLimpieza && (
                  <p className="text-xs text-amber-800 font-semibold flex items-center gap-1 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5" /> Requiere limpieza
                  </p>
                )}

                {isLibre && (
                  <p className="text-xs text-emerald-700 font-semibold mt-0.5">
                    Listo para check-in
                  </p>
                )}
              </div>

              {/* Precio / Noche */}
              <div
                className={`pt-2 border-t text-xs font-bold flex items-center justify-between ${
                  isOcupada ? 'border-teal-700 text-teal-200' : 'border-slate-200/80 text-slate-500'
                }`}
              >
                <span>${room.pricePerNight}/noche</span>
                <span>{room.type}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Modal de Acción sobre el Cuarto */}
      <RoomModal
        room={selectedRoom}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdate={loadRooms}
      />
    </div>
  );
};
