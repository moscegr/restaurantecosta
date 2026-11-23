import type {
  AnalyticsResponse,
  BusinessConfig,
  InvoiceData,
  Order,
  OrderStatus,
  PaymentMethod,
  Product,
  Room,
  StaffUser,
  Transaction,
  UserRole,
} from '../types';

const TOKEN_KEY = 'timon_auth_token';
const USER_KEY = 'timon_auth_user';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): StaffUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveSession(token: string, user: StaffUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 401) {
      clearSession();
    }
    throw new Error(data.error || `Error ${res.status} en el servidor`);
  }
  return data as T;
}

export const api = {
  // Health & Auth
  health: () => request<{ ok: boolean; database: string }>('/api/health'),
  getStaffList: () => request<StaffUser[]>('/api/auth/staff'),
  loginWithPin: (userId: string, pin: string) =>
    request<{ token: string; user: StaffUser }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ userId, pin }),
    }),

  // Users (Admin)
  getUsers: () => request<StaffUser[]>('/api/users'),
  createUser: (payload: { name: string; role: UserRole; pin: string; shift?: string }) =>
    request<StaffUser>('/api/users', { method: 'POST', body: JSON.stringify(payload) }),
  updateUser: (id: string, payload: Partial<StaffUser> & { pin?: string }) =>
    request<StaffUser>(`/api/users/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteUser: (id: string) => request<{ ok: boolean }>(`/api/users/${id}`, { method: 'DELETE' }),

  // Products
  getProducts: () => request<Product[]>('/api/products'),
  createProduct: (payload: Omit<Product, 'id'>) =>
    request<Product>('/api/products', { method: 'POST', body: JSON.stringify(payload) }),
  updateProduct: (id: string, payload: Partial<Product>) =>
    request<Product>(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteProduct: (id: string) => request<{ ok: boolean }>(`/api/products/${id}`, { method: 'DELETE' }),
  restockProduct: (
    id: string,
    payload: { quantity: number; unitCost: number; recordExpense: boolean; supplierNotes?: string }
  ) =>
    request<Product>(`/api/products/${id}/restock`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Orders (Open Tabs, KDS, POS Checkout)
  getOrders: (params?: { open?: boolean; status?: string; dateString?: string }) => {
    const qs = new URLSearchParams();
    if (params?.open) qs.set('open', 'true');
    if (params?.status) qs.set('status', params.status);
    if (params?.dateString) qs.set('dateString', params.dateString);
    const q = qs.toString();
    return request<Order[]>(`/api/orders${q ? `?${q}` : ''}`);
  },
  createOrder: (payload: {
    tableOrRamada: string;
    guestCount?: number;
    items: Array<{
      productId: string;
      name: string;
      quantity: number;
      price: number;
      costPrice?: number;
      station?: string;
      notes?: string;
    }>;
    notes?: string;
    payImmediately?: boolean;
    paymentMethod?: PaymentMethod;
    amountPaid?: number;
    tip?: number;
    discount?: number;
    invoiceData?: InvoiceData;
  }) => request<Order>('/api/orders', { method: 'POST', body: JSON.stringify(payload) }),
  updateOrder: (
    id: string,
    payload: {
      status?: OrderStatus;
      items?: Array<{
        productId: string;
        name: string;
        quantity: number;
        price: number;
        costPrice?: number;
        station?: string;
        notes?: string;
      }>;
      notes?: string;
      guestCount?: number;
      tableOrRamada?: string;
    }
  ) => request<Order>(`/api/orders/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  payOrder: (
    id: string,
    payload: {
      paymentMethod: PaymentMethod;
      amountPaid: number;
      tip?: number;
      discount?: number;
      invoiceData?: InvoiceData;
    }
  ) => request<Order>(`/api/orders/${id}/pay`, { method: 'POST', body: JSON.stringify(payload) }),

  // Rooms
  getRooms: () => request<Room[]>('/api/rooms'),
  createRoom: (payload: Omit<Room, 'id'>) =>
    request<Room>('/api/rooms', { method: 'POST', body: JSON.stringify(payload) }),
  updateRoom: (id: string, payload: Partial<Room>) =>
    request<Room>(`/api/rooms/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteRoom: (id: string) => request<{ ok: boolean }>(`/api/rooms/${id}`, { method: 'DELETE' }),
  checkInRoom: (
    id: string,
    payload: {
      guestName: string;
      guestPhone?: string;
      nights: number;
      chargeNow: boolean;
      paymentMethod?: PaymentMethod;
      notes?: string;
    }
  ) => request<Room>(`/api/rooms/${id}/checkin`, { method: 'POST', body: JSON.stringify(payload) }),
  checkOutRoom: (id: string) => request<Room>(`/api/rooms/${id}/checkout`, { method: 'POST' }),

  // Transactions & Analytics
  getTransactions: (dateString?: string) =>
    request<Transaction[]>(`/api/transactions${dateString ? `?dateString=${dateString}` : ''}`),
  createTransaction: (payload: {
    type: 'ingreso' | 'egreso';
    category: string;
    amount: number;
    description: string;
    paymentMethod: PaymentMethod;
  }) => request<Transaction>('/api/transactions', { method: 'POST', body: JSON.stringify(payload) }),
  getAnalytics: () => request<AnalyticsResponse>('/api/analytics'),

  // Config & Seed
  getConfig: () => request<BusinessConfig>('/api/config'),
  updateConfig: (payload: Partial<BusinessConfig>) =>
    request<BusinessConfig>('/api/config', { method: 'PUT', body: JSON.stringify(payload) }),
  resetSeed: () => request<{ seeded: boolean; message: string }>('/api/seed', { method: 'POST' }),
};
