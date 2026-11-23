import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, getAllowedTabsForRole, type ActiveTab } from './components/Sidebar';
import { PinLoginScreen } from './components/Auth/PinLoginScreen';
import { DashboardView } from './components/Hoy/DashboardView';
import { PosView } from './components/Vender/PosView';
import { MeseroView } from './components/Mesero/MeseroView';
import { CocinaView } from './components/Cocina/CocinaView';
import { CuartosView } from './components/Cuartos/CuartosView';
import { InventarioView } from './components/Inventario/InventarioView';
import { DineroView } from './components/Dinero/DineroView';
import { PersonalView } from './components/Personal/PersonalView';
import { SitioPublicoModal } from './components/SitioPublico/SitioPublicoModal';
import { ConfigModal } from './components/Configuracion/ConfigModal';
import { QuickExpenseModal } from './components/Dinero/QuickExpenseModal';

import { api, clearSession, getStoredToken, getStoredUser } from './services/api';
import type { BusinessConfig, Product, Room, StaffUser } from './types';

const TAB_TITLES: Record<ActiveTab, string> = {
  hoy: 'Panel Ejecutivo, Gráficas e IA Ligera',
  vender: 'Caja POS y Cobro de Cuentas Abiertas',
  mesero: 'Comandero Móvil de Mesas y Ramadas',
  cocina: 'Pantalla de Cocina y Estaciones (KDS)',
  cuartos: 'Gestión de Hospedaje y Cabañas',
  inventario: 'Catálogo de Platillos e Inventario',
  dinero: 'Finanzas, Facturación PDF y Control RESICO',
  personal: 'Administración de Personal y Roles',
};

export function App() {
  const [user, setUser] = useState<StaffUser | null>(() =>
    getStoredToken() ? getStoredUser() : null
  );
  const [activeTab, setActiveTab] = useState<ActiveTab>('hoy');
  const [config, setConfig] = useState<BusinessConfig | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [pendingKitchenCount, setPendingKitchenCount] = useState<number>(0);

  const [isPublicMenuOpen, setIsPublicMenuOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isQuickExpenseOpen, setIsQuickExpenseOpen] = useState(false);

  const loadPublicCatalog = async () => {
    try {
      const [cfg, prods, rms] = await Promise.all([
        api.getConfig(),
        api.getProducts(),
        api.getRooms(),
      ]);
      setConfig(cfg);
      setProducts(prods);
      setRooms(rms);
    } catch (err) {
      console.error('Error cargando catálogo inicial:', err);
    }
  };

  const loadAuthenticatedCounters = async () => {
    if (!getStoredToken()) return;
    try {
      const openOrders = await api.getOrders({ status: 'pendiente,en_preparacion' });
      setPendingKitchenCount(openOrders.length);
    } catch {
      // ignore if token expired
    }
  };

  useEffect(() => {
    loadPublicCatalog();
  }, []);

  useEffect(() => {
    if (user) {
      const allowed = getAllowedTabsForRole(user.role);
      if (!allowed.includes(activeTab)) {
        setActiveTab(allowed[0]);
      }
      loadPublicCatalog();
      loadAuthenticatedCounters();
    }
  }, [user]);

  const handleLogout = () => {
    clearSession();
    setUser(null);
  };

  // Si no hay sesión activa, mostrar pantalla de acceso rápido con PIN táctil
  if (!user) {
    return (
      <>
        <PinLoginScreen
          config={config}
          onLoginSuccess={(loggedUser) => {
            setUser(loggedUser);
            const allowed = getAllowedTabsForRole(loggedUser.role);
            setActiveTab(allowed[0]);
          }}
          onOpenPublicMenu={() => setIsPublicMenuOpen(true)}
        />
        <SitioPublicoModal
          products={products}
          rooms={rooms}
          config={config}
          isOpen={isPublicMenuOpen}
          onClose={() => setIsPublicMenuOpen(false)}
        />
      </>
    );
  }

  const occupiedRoomsCount = rooms.filter((r) => r.status === 'ocupada').length;
  const lowStockCount = products.filter((p) => p.stock <= p.minStock).length;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F4F6F9] antialiased text-slate-900 select-none">
      {/* Menú Lateral con control estricto de roles */}
      <Sidebar
        activeTab={activeTab}
        onChangeTab={(tab) => {
          setActiveTab(tab);
          loadPublicCatalog();
          loadAuthenticatedCounters();
        }}
        user={user}
        config={config}
        occupiedRoomsCount={occupiedRoomsCount}
        lowStockCount={lowStockCount}
        pendingKitchenOrdersCount={pendingKitchenCount}
        onOpenPublicMenu={() => setIsPublicMenuOpen(true)}
        onOpenSettings={() => setIsConfigOpen(true)}
        onOpenQuickExpense={() => setIsQuickExpenseOpen(true)}
        onLogout={handleLogout}
      />

      {/* Área Principal */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        <Navbar
          config={config}
          user={user}
          activeTabTitle={TAB_TITLES[activeTab]}
          onOpenPublicMenu={() => setIsPublicMenuOpen(true)}
        />

        <main className="flex-1 flex flex-col overflow-hidden relative">
          {activeTab === 'hoy' && (
            <DashboardView
              onGoToTab={(tab) => setActiveTab(tab)}
              onOpenQuickExpense={() => setIsQuickExpenseOpen(true)}
            />
          )}

          {activeTab === 'vender' && (
            <PosView
              config={config}
              canManageProducts={['admin', 'cajero'].includes(user.role)}
            />
          )}

          {activeTab === 'mesero' && <MeseroView user={user} config={config} />}

          {activeTab === 'cocina' && <CocinaView config={config} />}

          {activeTab === 'cuartos' && <CuartosView />}

          {activeTab === 'inventario' && <InventarioView />}

          {activeTab === 'dinero' && <DineroView config={config} />}

          {activeTab === 'personal' && user.role === 'admin' && <PersonalView />}
        </main>
      </div>

      <SitioPublicoModal
        products={products}
        rooms={rooms}
        config={config}
        isOpen={isPublicMenuOpen}
        onClose={() => setIsPublicMenuOpen(false)}
      />

      <ConfigModal
        config={config}
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        onSave={loadPublicCatalog}
      />

      <QuickExpenseModal
        isOpen={isQuickExpenseOpen}
        onClose={() => setIsQuickExpenseOpen(false)}
        onSuccess={() => {
          loadPublicCatalog();
          loadAuthenticatedCounters();
        }}
      />
    </div>
  );
}

export default App;
