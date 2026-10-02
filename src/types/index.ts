export type ProductCategory = 
  | 'Especialidades del Mar' 
  | 'Pescados y Mariscos' 
  | 'Bebidas y Chilate' 
  | 'Botanas y Antojitos' 
  | 'Postres y Cocos'
  | 'Hospedaje';

export interface Product {
  id?: number;
  name: string;
  category: ProductCategory;
  price: number;
  costPrice: number;
  stock: number;
  minStock: number;
  unit: 'pza' | 'orden' | 'kg' | 'vaso' | 'plato' | 'noche' | 'bolsa';
  icon: string;
  description?: string;
  active: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
}

export type PaymentMethod = 'efectivo' | 'tarjeta' | 'transferencia';

export interface SaleItem {
  productId: number;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Sale {
  id?: number;
  date: string; // ISO string
  dateString: string; // YYYY-MM-DD
  items: SaleItem[];
  total: number;
  costTotal: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  change: number;
  destination: string; // ej. 'Mesa 3', 'Ramada 5', 'Para Llevar', 'Cuarto 4'
  notes?: string;
  status: 'completada' | 'cancelada';
}

export type RoomStatus = 'libre' | 'ocupada' | 'limpieza' | 'reservada';
export type RoomType = 'Sencilla' | 'Doble' | 'Familiar' | 'Cabaña Frente al Mar';

export interface Room {
  id?: number;
  number: string;
  name: string;
  type: RoomType;
  pricePerNight: number;
  status: RoomStatus;
  guestName?: string;
  guestPhone?: string;
  checkInDate?: string;
  checkOutDate?: string;
  notes?: string;
  capacity: number;
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
  id?: number;
  date: string; // ISO
  dateString: string; // YYYY-MM-DD
  type: TransactionType;
  category: ExpenseCategory;
  amount: number;
  description: string;
  paymentMethod: PaymentMethod;
  referenceId?: number; // Order ID if linked
}

export interface BusinessConfig {
  id?: number;
  businessName: string;
  tagline: string;
  ownerName: string;
  phone: string;
  whatsapp: string;
  address: string;
  municipio: 'Copala' | 'Marquelia';
  state: string;
  rfc?: string;
  wifiName?: string;
  wifiPassword?: string;
  currency: string;
}

export interface AIRecommendation {
  id: string;
  type: 'forecast' | 'inventory_alert' | 'performance_insight';
  title: string;
  description: string;
  rationale: string; // El "porqué" explicable
  suggestedAction?: {
    label: string;
    actionType: 'restock' | 'view_cash' | 'view_pos';
    payload?: any;
  };
  urgency: 'info' | 'warning' | 'alert';
}
