export type UserRole = 'admin' | 'cajero' | 'mesero' | 'cocina' | 'recepcion';

export interface StaffUser {
  id: string;
  name: string;
  role: UserRole;
  shift: string;
  active: boolean;
}

export type ProductCategory =
  | 'Especialidades del Mar'
  | 'Pescados y Mariscos'
  | 'Bebidas y Chilate'
  | 'Botanas y Antojitos'
  | 'Postres y Cocos';

export type KitchenStation = 'cocina' | 'barra' | 'fria';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  station: KitchenStation;
  price: number;
  costPrice: number;
  stock: number;
  minStock: number;
  unit: 'pza' | 'orden' | 'kg' | 'vaso' | 'plato' | 'bolsa';
  imageUrl: string;
  description?: string;
  active: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
}

export type PaymentMethod = 'efectivo' | 'tarjeta' | 'transferencia';
export type OrderStatus = 'pendiente' | 'en_preparacion' | 'listo' | 'entregado' | 'cobrado' | 'cancelado';

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  costPrice?: number;
  subtotal: number;
  station?: KitchenStation;
  notes?: string;
}

export interface InvoiceData {
  rfc: string;
  razonSocial: string;
  usoCfdi: string;
  email: string;
}

export interface Order {
  id: string;
  folio: string;
  tableOrRamada: string;
  guestCount: number;
  waiterId?: string;
  waiterName: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  tip: number;
  discount: number;
  total: number;
  costTotal: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod | '';
  amountPaid: number;
  change: number;
  dateString: string;
  notes?: string;
  createdAt: string;
  paidAt?: string;
  invoiceData?: InvoiceData;
}

export type RoomStatus = 'libre' | 'ocupada' | 'limpieza' | 'reservada';
export type RoomType = 'Sencilla' | 'Doble' | 'Familiar' | 'Cabaña Frente al Mar';

export interface Room {
  id: string;
  number: string;
  name: string;
  type: RoomType;
  pricePerNight: number;
  status: RoomStatus;
  guestName?: string;
  guestPhone?: string;
  checkInDate?: string;
  checkOutDate?: string;
  capacity: number;
  imageUrl: string;
  amenities?: string[];
  notes?: string;
}

export type TransactionType = 'ingreso' | 'egreso';
export type ExpenseCategory =
  | 'Pescado y Marisco Fresco'
  | 'Hielo y Bebidas'
  | 'Carbón y Leña'
  | 'Gas'
  | 'Abarrotes y Verduras'
  | 'Mantenimiento e Higiene'
  | 'Nómina / Propinas'
  | 'Venta POS'
  | 'Hospedaje'
  | 'Otro';

export interface Transaction {
  id: string;
  date: string;
  dateString: string;
  type: TransactionType;
  category: ExpenseCategory;
  amount: number;
  description: string;
  paymentMethod: PaymentMethod;
  referenceId?: string;
  userName?: string;
}

export interface BusinessConfig {
  id?: string;
  businessName: string;
  tagline: string;
  ownerName: string;
  phone: string;
  whatsapp: string;
  address: string;
  municipio: 'Copala' | 'Marquelia';
  state: string;
  rfc?: string;
  taxRegime?: string;
  ivaRate?: number;
  wifiName?: string;
  wifiPassword?: string;
  currency: string;
  thermalPaperWidth?: '58mm' | '80mm';
}

export interface AIRecommendation {
  id: string;
  type: 'forecast' | 'inventory_alert' | 'performance_insight';
  title: string;
  description: string;
  rationale: string;
  urgency: 'info' | 'warning' | 'alert';
  suggestedAction?: {
    label: string;
    actionType: 'restock' | 'view_cash' | 'view_pos';
    productId?: string;
  };
}

export interface AnalyticsResponse {
  todaySummary: {
    ingresos: number;
    egresos: number;
    utilidad: number;
    occupiedRooms: number;
    totalRooms: number;
    openOrdersCount: number;
  };
  dailySeries: {
    date: string;
    label: string;
    ingresos: number;
    egresos: number;
    utilidad: number;
  }[];
  paymentBreakdown: { name: string; value: number }[];
  topProducts: { name: string; quantity: number; revenue: number }[];
  aiInsights: AIRecommendation[];
}
