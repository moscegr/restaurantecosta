import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, type ActiveTab } from './components/Sidebar';
import { DashboardView } from './components/Hoy/DashboardView';
import { PosView } from './components/Vender/PosView';
import { CuartosView } from './components/Cuartos/CuartosView';
import { InventarioView } from './components/Inventario/InventarioView';
import { DineroView } from './components/Dinero/DineroView';
import { SitioPublicoModal } from './components/SitioPublico/SitioPublicoModal';
import { ConfigModal } from './components/Configuracion/ConfigModal';
import { QuickExpenseModal } from './components/Dinero/QuickExpenseModal';

import { db } from './db/db';
import { initDatabaseWithSeedData } from './db/seedData';
import type { BusinessConfig, Product, Room } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('hoy');
  const [config, setConfig] = useState<BusinessConfig | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isReady, setIsReady] = useState(false);

  // Modales Globales
  const [isPublicMenuOpen, setIsPublicMenuOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isQuickExpenseOpen, setIsQuickExpenseOpen] = useState(false);

  // Inicialización de la base de datos
  const loadAppData = async () => {
    try {
      // Si la base tiene pocos productos (versión semilla anterior), forzar recarga con los datos abundantes
      const count = await db.products.count();
      if (count < 15) {
        await initDatabaseWithSeedData(true);
      } else {
        await initDatabaseWithSeedData();
      }

      const [allConfig, allProducts, allRooms] = await Promise.all([
        db.businessConfig.toArray(),
        db.products.toArray(),
        db.rooms.toArray(),
      ]);

      if (allConfig.length > 0) {
        setConfig(allConfig[0]);
      }
      setProducts(allProducts);
      setRooms(allRooms);
      setIsReady(true);
    } catch (err) {
      console.error('Error inicializando la aplicación:', err);
    }
  };

  useEffect(() => {
    loadAppData();
  }, []);

  if (!isReady) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-cyan-950 text-white p-4">
        <div className="w-14 h-14 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-xl font-black text-amber-300">Timón Costa Chica</h2>
        <p className="text-xs text-teal-200 mt-1">
          Preparando tu punto de venta e inteligencia artificial ligera...
        </p>
      </div>
    );
  }

  // Contadores para badges en Sidebar
  const occupiedRoomsCount = rooms.filter(r => r.status === 'ocupada').length;
  const lowStockCount = products.filter(p => p.stock <= p.minStock).length;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans antialiased text-slate-900 select-none">
      {/* 1. Menú Lateral Izquierdo (Para tablets, pantallas touch y desktop sin traslapes) */}
      <Sidebar
        activeTab={activeTab}
        onChangeTab={(tab) => {
          setActiveTab(tab);
          loadAppData();
        }}
        config={config}
        occupiedRoomsCount={occupiedRoomsCount}
        lowStockCount={lowStockCount}
        onOpenPublicMenu={() => setIsPublicMenuOpen(true)}
        onOpenSettings={() => setIsConfigOpen(true)}
        onOpenQuickExpense={() => setIsQuickExpenseOpen(true)}
      />

      {/* 2. Área de Trabajo Principal con scroll limpio y sin elementos flotantes que tapen la vista */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0 bg-slate-100">
        <Navbar
          config={config}
          onOpenPublicMenu={() => setIsPublicMenuOpen(true)}
          onOpenSettings={() => setIsConfigOpen(true)}
        />

        <main className="flex-1 flex flex-col overflow-hidden relative">
          {activeTab === 'hoy' && (
            <DashboardView
              onGoToTab={(tab) => setActiveTab(tab)}
              onOpenQuickExpense={() => setIsQuickExpenseOpen(true)}
            />
          )}

          {activeTab === 'vender' && (
            <PosView config={config} />
          )}

          {activeTab === 'cuartos' && (
            <CuartosView />
          )}

          {activeTab === 'inventario' && (
            <InventarioView />
          )}

          {activeTab === 'dinero' && (
            <DineroView config={config} />
          )}
        </main>
      </div>

      {/* 3. Modal Sitio Público / Menú Digital QR */}
      <SitioPublicoModal
        products={products}
        rooms={rooms}
        config={config}
        isOpen={isPublicMenuOpen}
        onClose={() => setIsPublicMenuOpen(false)}
      />

      {/* 4. Modal de Configuración & Datos de Prueba */}
      <ConfigModal
        config={config}
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        onSave={loadAppData}
      />

      {/* 5. Modal de Gasto Rápido Global */}
      <QuickExpenseModal
        isOpen={isQuickExpenseOpen}
        onClose={() => setIsQuickExpenseOpen(false)}
        onSuccess={loadAppData}
      />
    </div>
  );
}

export default App;
