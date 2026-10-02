import { db } from './db';
import type { Product, Room, BusinessConfig, Sale, Transaction, KitchenOrder } from '../types';

export const initialConfig: BusinessConfig = {
  businessName: 'Ramada & Cabañas Las Brisas',
  tagline: 'Sabor Costeño Frente al Mar · Playa Ventura',
  ownerName: 'Doña Rosaura y Familia',
  phone: '741 123 4567',
  whatsapp: '527411234567',
  address: 'Playa Ventura, Zona de Ramadas #14',
  municipio: 'Copala',
  state: 'Guerrero',
  rfc: 'ROSR780512AB3',
  wifiName: 'Ramada_LasBrisas_WiFi',
  wifiPassword: 'pescadito_fresco',
  currency: 'MXN',
};

export const initialProducts: Product[] = [
  {
    name: 'Pescado a la Talla (Huachinango entero)',
    category: 'Especialidades del Mar',
    price: 320,
    costPrice: 140,
    stock: 18,
    minStock: 10,
    unit: 'kg',
    icon: '🐟',
    description: 'Asado a las brasas con adobo tradicional costeño, mayonesa y ensalada fresca con tortillas a mano.',
    active: true,
  },
  {
    name: 'Camarones al Mojo de Ajo / Empanizados',
    category: 'Pescados y Mariscos',
    price: 260,
    costPrice: 110,
    stock: 24,
    minStock: 12,
    unit: 'orden',
    icon: '🦐',
    description: 'Camarones frescos de la costa acompañados de arroz blanco, ensalada y frijoles negros.',
    active: true,
  },
  {
    name: 'Langosta Fresca a la Mantequilla',
    category: 'Especialidades del Mar',
    price: 480,
    costPrice: 220,
    stock: 6,
    minStock: 5,
    unit: 'orden',
    icon: '🦞',
    description: 'De la pesca artesanal de Marquelia, sazonada al momento con ajo y mantequilla suave.',
    active: true,
  },
  {
    name: 'Pulpo Enamorado Costeño',
    category: 'Especialidades del Mar',
    price: 290,
    costPrice: 120,
    stock: 9,
    minStock: 6,
    unit: 'orden',
    icon: '🐙',
    description: 'Pulpo tierno cocido al punto, bañado en mayonesa sazonada, cebolla morada, apio, cilantro y chipotle.',
    active: true,
  },
  {
    name: 'Coctel Campechano (Camarón y Pulpo)',
    category: 'Pescados y Mariscos',
    price: 190,
    costPrice: 75,
    stock: 14,
    minStock: 8,
    unit: 'orden',
    icon: '🍸',
    description: 'Con salsa coctelera especial costeña, aguacate hass, cilantro y galletitas saladas.',
    active: true,
  },
  {
    name: 'Ceviche Costeño Mixto',
    category: 'Pescados y Mariscos',
    price: 180,
    costPrice: 70,
    stock: 15,
    minStock: 8,
    unit: 'orden',
    icon: '🥣',
    description: 'Pescado fresco del día, camarón, jitomate, cebolla morada, chile verde y aguacate.',
    active: true,
  },
  {
    name: 'Caldo de Camarón y Pescado',
    category: 'Pescados y Mariscos',
    price: 210,
    costPrice: 85,
    stock: 11,
    minStock: 6,
    unit: 'plato',
    icon: '🍲',
    description: 'Consomé caliente con camarones con cabeza, verduras de la región, epazote y chile guajillo.',
    active: true,
  },
  {
    name: 'Tiritas de Pescado Marinadas',
    category: 'Botanas y Antojitos',
    price: 160,
    costPrice: 65,
    stock: 20,
    minStock: 8,
    unit: 'orden',
    icon: '🥗',
    description: 'Láminas de pescado fresco marinadas con limón costeño, cebolla morada y orégano.',
    active: true,
  },
  {
    name: 'Quesadillas de Camarón con Queso Cincho',
    category: 'Botanas y Antojitos',
    price: 130,
    costPrice: 50,
    stock: 18,
    minStock: 8,
    unit: 'orden',
    icon: '🧀',
    description: '3 empanadas de maíz rellenas de camarón guisado con queso costeño artesanal.',
    active: true,
  },
  {
    name: 'Chilate Costeño Espumoso con Pan de Huevo',
    category: 'Bebidas y Chilate',
    price: 50,
    costPrice: 18,
    stock: 35,
    minStock: 15,
    unit: 'vaso',
    icon: '🧉',
    description: 'Bebida ancestral de cacao, arroz, canela, servida bien fría con hielo y espumada tradicionalmente.',
    active: true,
  },
  {
    name: 'Agua de Coco Frío en su Concha',
    category: 'Bebidas y Chilate',
    price: 45,
    costPrice: 15,
    stock: 30,
    minStock: 12,
    unit: 'pza',
    icon: '🥥',
    description: 'Coco fresco de palmera cortado al instante, servido frío con popote ecológico y pulpa tierna.',
    active: true,
  },
  {
    name: 'Cerveza Corona / Victoria (Media Helada)',
    category: 'Bebidas y Chilate',
    price: 40,
    costPrice: 21,
    stock: 22,
    minStock: 36,
    unit: 'pza',
    icon: '🍺',
    description: 'Cerveza helada estilo costeño. Opcional preparada con sal, limón y chile.',
    active: true,
  },
  {
    name: 'Michelada Preparada con Camarón Seco',
    category: 'Bebidas y Chilate',
    price: 85,
    costPrice: 38,
    stock: 16,
    minStock: 10,
    unit: 'vaso',
    icon: '🍹',
    description: 'Cerveza con clamato, salsa inglesa, limón costeño, chamoy y camarones secos botaneros.',
    active: true,
  },
  {
    name: 'Refresco Yoli de Acapulco / Coca-Cola Vidrio',
    category: 'Bebidas y Chilate',
    price: 35,
    costPrice: 16,
    stock: 28,
    minStock: 15,
    unit: 'pza',
    icon: '🥤',
    description: 'Refrescos bien fríos en botella retornable de vidrio tradicional.',
    active: true,
  },
  {
    name: 'Bolsa de Hielo de 5 kg',
    category: 'Bebidas y Chilate',
    price: 35,
    costPrice: 22,
    stock: 2,
    minStock: 8,
    unit: 'bolsa',
    icon: '🧊',
    description: 'Insumo esencial para hieleras de ramada y coctelería.',
    active: true,
  },
  {
    name: 'Cocada Tradicional Horneada',
    category: 'Postres y Cocos',
    price: 35,
    costPrice: 12,
    stock: 16,
    minStock: 6,
    unit: 'pza',
    icon: '🥧',
    description: 'Dulce típico de coco rallado con piloncillo y canela.',
    active: true,
  },
  {
    name: 'Plátanos Machos Fritos con Crema y Queso',
    category: 'Postres y Cocos',
    price: 60,
    costPrice: 22,
    stock: 12,
    minStock: 5,
    unit: 'orden',
    icon: '🍌',
    description: 'Plátano maduro frito en mantequilla, con crema de rancho y queso espolvoreado.',
    active: true,
  },
];

export const initialRooms: Room[] = [
  {
    number: '1',
    name: 'Cabaña 1 - Brisa Marina',
    type: 'Cabaña Frente al Mar',
    pricePerNight: 950,
    status: 'ocupada',
    guestName: 'Familia Gómez Rivera',
    guestPhone: '744 555 1290',
    checkInDate: '2026-10-01',
    checkOutDate: '2026-10-03',
    capacity: 4,
    notes: 'Solicitaron hamaca extra frente al pórtico.',
  },
  {
    number: '2',
    name: 'Cabaña 2 - El Palmar',
    type: 'Cabaña Frente al Mar',
    pricePerNight: 950,
    status: 'ocupada',
    guestName: 'Lic. Laura Morales Cruz',
    guestPhone: '55 1234 5678',
    checkInDate: '2026-10-01',
    checkOutDate: '2026-10-02',
    capacity: 4,
    notes: 'Check-out programado 12:00 PM.',
  },
  {
    number: '3',
    name: 'Cuarto 3 - Puesta de Sol',
    type: 'Doble',
    pricePerNight: 700,
    status: 'libre',
    capacity: 2,
  },
  {
    number: '4',
    name: 'Cuarto 4 - Caracol',
    type: 'Sencilla',
    pricePerNight: 550,
    status: 'libre',
    capacity: 2,
  },
  {
    number: '5',
    name: 'Cuarto 5 - Barra de Tecoanapa',
    type: 'Doble',
    pricePerNight: 700,
    status: 'limpieza',
    notes: 'Sábanas cambiadas, falta trapear piso.',
    capacity: 2,
  },
  {
    number: '6',
    name: 'Cuarto 6 - Bocana',
    type: 'Doble',
    pricePerNight: 700,
    status: 'libre',
    capacity: 2,
  },
  {
    number: '7',
    name: 'Cabaña 7 - Coral Costeño',
    type: 'Familiar',
    pricePerNight: 1200,
    status: 'reservada',
    guestName: 'Ing. Roberto Silva (WhatsApp)',
    guestPhone: '747 987 6543',
    checkInDate: '2026-10-02',
    checkOutDate: '2026-10-04',
    capacity: 6,
    notes: 'Anticipo 50% recibido por transferencia.',
  },
  {
    number: '8',
    name: 'Cuarto 8 - El Faro',
    type: 'Sencilla',
    pricePerNight: 550,
    status: 'ocupada',
    guestName: 'Carlos Domínguez',
    guestPhone: '741 234 8901',
    checkInDate: '2026-10-01',
    checkOutDate: '2026-10-02',
    capacity: 2,
    notes: 'Cliente frecuente de Ometepec.',
  },
  {
    number: '9',
    name: 'Cabaña 9 - Las Peñitas',
    type: 'Familiar',
    pricePerNight: 1100,
    status: 'reservada',
    guestName: 'Familia Ortiz Hernández',
    guestPhone: '55 9876 5432',
    checkInDate: '2026-10-03',
    checkOutDate: '2026-10-05',
    capacity: 5,
    notes: 'Llegan el sábado en la mañana.',
  },
  {
    number: '10',
    name: 'Cuarto 10 - Playa Ventura',
    type: 'Doble',
    pricePerNight: 650,
    status: 'limpieza',
    notes: 'Limpieza programada tras salida de las 11 AM.',
    capacity: 2,
  },
];

// Generar ventas y gastos históricos abundantes para pruebas
export function generateSeedHistoricalData(): { sales: Sale[]; transactions: Transaction[] } {
  const sales: Sale[] = [];
  const transactions: Transaction[] = [];

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // Ventas de HOY (Múltiples para poder navegar y ver lista completa)
  const todaySalesData = [
    {
      hoursAgo: 6,
      destination: 'Ramada 1 (Playa)',
      items: [
        { productId: 1, name: 'Pescado a la Talla', quantity: 2, price: 320, subtotal: 640 },
        { productId: 10, name: 'Chilate Costeño', quantity: 4, price: 50, subtotal: 200 },
        { productId: 12, name: 'Cerveza Corona', quantity: 6, price: 40, subtotal: 240 },
      ],
      total: 1080,
      costTotal: 460,
      paymentMethod: 'efectivo' as const,
      amountPaid: 1100,
      change: 20,
    },
    {
      hoursAgo: 5,
      destination: 'Mesa 4 (Palapa)',
      items: [
        { productId: 2, name: 'Camarones al Mojo', quantity: 2, price: 260, subtotal: 520 },
        { productId: 6, name: 'Ceviche Costeño Mixto', quantity: 1, price: 180, subtotal: 180 },
        { productId: 11, name: 'Agua de Coco Frío', quantity: 3, price: 45, subtotal: 135 },
      ],
      total: 835,
      costTotal: 335,
      paymentMethod: 'tarjeta' as const,
      amountPaid: 835,
      change: 0,
    },
    {
      hoursAgo: 4,
      destination: 'Ramada 4 (Playa)',
      items: [
        { productId: 1, name: 'Pescado a la Talla', quantity: 2, price: 320, subtotal: 640 },
        { productId: 10, name: 'Chilate Costeño', quantity: 3, price: 50, subtotal: 150 },
        { productId: 12, name: 'Cerveza Corona', quantity: 4, price: 40, subtotal: 160 },
      ],
      total: 950,
      costTotal: 414,
      paymentMethod: 'efectivo' as const,
      amountPaid: 1000,
      change: 50,
    },
    {
      hoursAgo: 3,
      destination: 'Mesa 7 (Sombra)',
      items: [
        { productId: 2, name: 'Camarones al Mojo', quantity: 2, price: 260, subtotal: 520 },
        { productId: 11, name: 'Agua de Coco Frío', quantity: 2, price: 45, subtotal: 90 },
        { productId: 6, name: 'Ceviche Costeño Mixto', quantity: 1, price: 180, subtotal: 180 },
        { productId: 12, name: 'Cerveza Corona', quantity: 5, price: 40, subtotal: 200 },
      ],
      total: 990,
      costTotal: 405,
      paymentMethod: 'transferencia' as const,
      amountPaid: 990,
      change: 0,
    },
    {
      hoursAgo: 2,
      destination: 'Ramada 2 (Playa)',
      items: [
        { productId: 3, name: 'Langosta Fresca', quantity: 1, price: 480, subtotal: 480 },
        { productId: 13, name: 'Michelada Preparada', quantity: 2, price: 85, subtotal: 170 },
        { productId: 8, name: 'Tiritas de Pescado', quantity: 1, price: 160, subtotal: 160 },
      ],
      total: 810,
      costTotal: 340,
      paymentMethod: 'efectivo' as const,
      amountPaid: 1000,
      change: 190,
    },
    {
      hoursAgo: 1,
      destination: 'Para Llevar',
      items: [
        { productId: 1, name: 'Pescado a la Talla', quantity: 1, price: 320, subtotal: 320 },
        { productId: 10, name: 'Chilate Costeño', quantity: 2, price: 50, subtotal: 100 },
        { productId: 16, name: 'Cocada Tradicional', quantity: 4, price: 35, subtotal: 140 },
      ],
      total: 560,
      costTotal: 220,
      paymentMethod: 'efectivo' as const,
      amountPaid: 600,
      change: 40,
    },
  ];

  todaySalesData.forEach((sData, idx) => {
    const saleTime = new Date(today.getTime() - sData.hoursAgo * 3600000).toISOString();
    sales.push({
      date: saleTime,
      dateString: todayStr,
      items: sData.items,
      total: sData.total,
      costTotal: sData.costTotal,
      paymentMethod: sData.paymentMethod,
      amountPaid: sData.amountPaid,
      change: sData.change,
      destination: sData.destination,
      status: 'completada',
    });

    transactions.push({
      date: saleTime,
      dateString: todayStr,
      type: 'ingreso',
      category: 'Venta POS',
      amount: sData.total,
      description: `Venta #${idx + 1} - ${sData.destination}`,
      paymentMethod: sData.paymentMethod,
    });
  });

  // Hospedaje cobrado hoy (Cabaña 1)
  transactions.push({
    date: new Date(today.getTime() - 7 * 3600000).toISOString(),
    dateString: todayStr,
    type: 'ingreso',
    category: 'Hospedaje',
    amount: 1900,
    description: 'Hospedaje Cabaña 1 (2 noches) - Familia Gómez Rivera',
    paymentMethod: 'transferencia',
  });

  // Gastos / Egresos de HOY (Múltiples para probar scroll completo)
  const todayExpenses = [
    {
      hoursAgo: 7,
      category: 'Pescado y Marisco Fresco' as const,
      amount: 850,
      description: 'Compra de 6 kg de huachinango vivo a pescador Don Manuel',
      paymentMethod: 'efectivo' as const,
    },
    {
      hoursAgo: 6,
      category: 'Hielo y Bebidas' as const,
      amount: 140,
      description: 'Compra de 5 bolsas de hielo a la camioneta repartidora',
      paymentMethod: 'efectivo' as const,
    },
    {
      hoursAgo: 5,
      category: 'Carbón y Leña' as const,
      amount: 180,
      description: '2 costales de carbón de encino para la talla',
      paymentMethod: 'efectivo' as const,
    },
    {
      hoursAgo: 4,
      category: 'Abarrotes y Verduras' as const,
      amount: 220,
      description: 'Limones criollos, cebolla morada, aguacates y cilantro en mercado Copala',
      paymentMethod: 'efectivo' as const,
    },
    {
      hoursAgo: 3,
      category: 'Gas' as const,
      amount: 450,
      description: 'Recarga de cilindro de gas 30 kg para cocina de ramada',
      paymentMethod: 'efectivo' as const,
    },
    {
      hoursAgo: 2,
      category: 'Nómina / Propinas' as const,
      amount: 300,
      description: 'Adelanto de turno a ayudante de cocina',
      paymentMethod: 'efectivo' as const,
    },
    {
      hoursAgo: 1,
      category: 'Mantenimiento e Higiene' as const,
      amount: 130,
      description: 'Cloro, jabón y bolsas de basura para cabañas y palapa',
      paymentMethod: 'efectivo' as const,
    },
  ];

  todayExpenses.forEach((exp) => {
    transactions.push({
      date: new Date(today.getTime() - exp.hoursAgo * 3600000).toISOString(),
      dateString: todayStr,
      type: 'egreso',
      category: exp.category,
      amount: exp.amount,
      description: exp.description,
      paymentMethod: exp.paymentMethod,
    });
  });

  // Histórico de los últimos 28 días (4 semanas) para promedios por día de la semana
  for (let i = 1; i <= 28; i++) {
    const pastDate = new Date(today.getTime() - i * 24 * 3600000);
    const pastDateStr = pastDate.toISOString().split('T')[0];
    const dayOfWeek = pastDate.getDay();

    let baseAmount = 3200;
    if (dayOfWeek === 0) baseAmount = 10920; // Domingo fuerte
    else if (dayOfWeek === 6) baseAmount = 8800; // Sábado
    else if (dayOfWeek === 5) baseAmount = 5600; // Viernes
    else if (dayOfWeek === 1) baseAmount = 4270; // Lunes (típico en protocolo: $4,271)
    else baseAmount = 3100;

    const finalAmount = Math.round(baseAmount * (0.92 + Math.random() * 0.16));

    sales.push({
      date: pastDate.toISOString(),
      dateString: pastDateStr,
      items: [
        { productId: 1, name: 'Pescado a la Talla', quantity: Math.floor(finalAmount / 380), price: 320, subtotal: Math.floor(finalAmount / 380) * 320 },
      ],
      total: finalAmount,
      costTotal: Math.round(finalAmount * 0.42),
      paymentMethod: i % 3 === 0 ? 'tarjeta' : (i % 2 === 0 ? 'transferencia' : 'efectivo'),
      amountPaid: finalAmount,
      change: 0,
      destination: 'Mesa general',
      status: 'completada',
    });

    transactions.push({
      date: pastDate.toISOString(),
      dateString: pastDateStr,
      type: 'ingreso',
      category: 'Venta POS',
      amount: finalAmount,
      description: `Venta acumulada del día ${pastDateStr}`,
      paymentMethod: 'efectivo',
    });

    const expenseAmount = Math.round(finalAmount * 0.36);
    transactions.push({
      date: pastDate.toISOString(),
      dateString: pastDateStr,
      type: 'egreso',
      category: 'Pescado y Marisco Fresco',
      amount: expenseAmount,
      description: `Insumos y pescado fresco del día ${pastDateStr}`,
      paymentMethod: 'efectivo',
    });
  }

  return { sales, transactions };
}

export const initialKitchenOrders: KitchenOrder[] = [
  {
    tableOrRamada: 'Ramada 3 (Playa)',
    waiterName: 'Toño (Mesero)',
    items: [
      { productId: 1, name: 'Pescado a la Talla', quantity: 2, price: 320, notes: 'Bien dorado a las brasas' },
      { productId: 10, name: 'Chilate Costeño con Pan', quantity: 3, price: 50, notes: 'Bien frío con bastante espuma' },
    ],
    total: 790,
    status: 'pendiente',
    createdAt: new Date(Date.now() - 4 * 60000).toISOString(),
    dateString: new Date().toISOString().split('T')[0],
    notes: 'Mesa con niños, salsas aparte',
  },
  {
    tableOrRamada: 'Mesa 2 (Palapa)',
    waiterName: 'Lupita (Mesera)',
    items: [
      { productId: 3, name: 'Langosta Fresca a la Mantequilla', quantity: 1, price: 480, notes: 'Poco ajo' },
      { productId: 13, name: 'Michelada Preparada', quantity: 2, price: 85, notes: 'Escarchada con limón y sal' },
    ],
    total: 650,
    status: 'en_preparacion',
    createdAt: new Date(Date.now() - 11 * 60000).toISOString(),
    dateString: new Date().toISOString().split('T')[0],
  },
  {
    tableOrRamada: 'Ramada 1 (Playa)',
    waiterName: 'Toño (Mesero)',
    items: [
      { productId: 4, name: 'Pulpo Enamorado Costeño', quantity: 1, price: 290 },
      { productId: 6, name: 'Ceviche Costeño Mixto', quantity: 1, price: 180, notes: 'Aguacate extra' },
    ],
    total: 470,
    status: 'listo',
    createdAt: new Date(Date.now() - 16 * 60000).toISOString(),
    dateString: new Date().toISOString().split('T')[0],
  },
];

export async function initDatabaseWithSeedData(force = false) {
  const productCount = await db.products.count();
  if (productCount > 0 && !force) {
    return;
  }

  await db.transaction('rw', [db.products, db.rooms, db.sales, db.transactions, db.businessConfig, db.kitchenOrders], async () => {
    if (force) {
      await db.products.clear();
      await db.rooms.clear();
      await db.sales.clear();
      await db.transactions.clear();
      await db.businessConfig.clear();
      await db.kitchenOrders.clear();
    }

    await db.businessConfig.add(initialConfig);
    await db.products.bulkAdd(initialProducts);
    await db.rooms.bulkAdd(initialRooms);
    await db.kitchenOrders.bulkAdd(initialKitchenOrders);

    const { sales, transactions } = generateSeedHistoricalData();
    await db.sales.bulkAdd(sales);
    await db.transactions.bulkAdd(transactions);
  });
}
