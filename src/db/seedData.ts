import { db } from './db';
import type { Product, Room, BusinessConfig, Sale, Transaction } from '../types';

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
    name: 'Cerveza Corona / Victoria (Media)',
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
    name: 'Orden de Sopes Costeños con Queso y Crema',
    category: 'Botanas y Antojitos',
    price: 110,
    costPrice: 40,
    stock: 20,
    minStock: 10,
    unit: 'orden',
    icon: '🌮',
    description: '4 sopes pellizcados con frijoles refritos, lechuga fresca, queso cincho costeño y salsa molcajeteada.',
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
    guestName: 'Laura Morales Cruz',
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
    status: 'libre',
    capacity: 2,
  },
];

// Generar ventas históricas para alimentar la IA explicable
export function generateSeedHistoricalData(): { sales: Sale[]; transactions: Transaction[] } {
  const sales: Sale[] = [];
  const transactions: Transaction[] = [];

  const today = new Date();
  
  // Ventas de hoy
  const todayStr = today.toISOString().split('T')[0];

  // Venta 1 de hoy
  sales.push({
    date: new Date(today.getTime() - 3 * 3600000).toISOString(),
    dateString: todayStr,
    items: [
      { productId: 1, name: 'Pescado a la Talla', quantity: 2, price: 320, subtotal: 640 },
      { productId: 6, name: 'Chilate Costeño', quantity: 3, price: 50, subtotal: 150 },
      { productId: 8, name: 'Cerveza Corona', quantity: 4, price: 40, subtotal: 160 },
    ],
    total: 950,
    costTotal: 414,
    paymentMethod: 'efectivo',
    amountPaid: 1000,
    change: 50,
    destination: 'Ramada 4 (Playa)',
    status: 'completada',
  });

  // Venta 2 de hoy
  sales.push({
    date: new Date(today.getTime() - 1 * 3600000).toISOString(),
    dateString: todayStr,
    items: [
      { productId: 2, name: 'Camarones al Mojo', quantity: 2, price: 260, subtotal: 520 },
      { productId: 7, name: 'Agua de Coco Frío', quantity: 2, price: 45, subtotal: 90 },
      { productId: 4, name: 'Ceviche Costeño Mixto', quantity: 1, price: 180, subtotal: 180 },
      { productId: 8, name: 'Cerveza Corona', quantity: 5, price: 40, subtotal: 200 },
    ],
    total: 990,
    costTotal: 405,
    paymentMethod: 'transferencia',
    amountPaid: 990,
    change: 0,
    destination: 'Mesa 7 (Sombra)',
    status: 'completada',
  });

  // Gastos de hoy
  transactions.push({
    date: new Date(today.getTime() - 4 * 3600000).toISOString(),
    dateString: todayStr,
    type: 'egreso',
    category: 'Hielo y Bebidas',
    amount: 140,
    description: 'Compra de 5 bolsas de hielo a la camioneta repartidora',
    paymentMethod: 'efectivo',
  });

  transactions.push({
    date: new Date(today.getTime() - 2 * 3600000).toISOString(),
    dateString: todayStr,
    type: 'egreso',
    category: 'Carbón y Leña',
    amount: 180,
    description: '2 costales de carbón de encino para la talla',
    paymentMethod: 'efectivo',
  });

  transactions.push({
    date: new Date(today.getTime() - 1 * 3600000).toISOString(),
    dateString: todayStr,
    type: 'egreso',
    category: 'Abarrotes y Verduras',
    amount: 100,
    description: 'Limones criollos, cebolla morada y cilantro',
    paymentMethod: 'efectivo',
  });

  // Transacciones de ingreso reflejadas de hoy
  transactions.push({
    date: new Date(today.getTime() - 3 * 3600000).toISOString(),
    dateString: todayStr,
    type: 'ingreso',
    category: 'Venta POS',
    amount: 950,
    description: 'Venta #1 - Ramada 4',
    paymentMethod: 'efectivo',
  });

  transactions.push({
    date: new Date(today.getTime() - 1 * 3600000).toISOString(),
    dateString: todayStr,
    type: 'ingreso',
    category: 'Venta POS',
    amount: 990,
    description: 'Venta #2 - Mesa 7',
    paymentMethod: 'transferencia',
  });

  // Histórico de los últimos 28 días (4 semanas) para promedios por día de la semana
  for (let i = 1; i <= 28; i++) {
    const pastDate = new Date(today.getTime() - i * 24 * 3600000);
    const pastDateStr = pastDate.toISOString().split('T')[0];
    const dayOfWeek = pastDate.getDay(); // 0 = Domingo, 1 = Lunes, 6 = Sábado

    // Los fines de semana (viernes, sábado, domingo) venden más en la playa
    let baseAmount = 2500;
    if (dayOfWeek === 0) baseAmount = 10920; // Domingo fuerte
    else if (dayOfWeek === 6) baseAmount = 8800; // Sábado
    else if (dayOfWeek === 5) baseAmount = 5600; // Viernes
    else if (dayOfWeek === 1) baseAmount = 4270; // Lunes (típico en la presentación: $4,271)
    else baseAmount = 3100; // Martes a Jueves

    // Pequeña variación
    const finalAmount = Math.round(baseAmount * (0.9 + Math.random() * 0.2));

    sales.push({
      date: pastDate.toISOString(),
      dateString: pastDateStr,
      items: [
        { productId: 1, name: 'Pescado a la Talla', quantity: Math.floor(finalAmount / 400), price: 320, subtotal: Math.floor(finalAmount / 400) * 320 },
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

    // Gastos históricos
    const expenseAmount = Math.round(finalAmount * 0.38);
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

export async function initDatabaseWithSeedData(force = false) {
  const productCount = await db.products.count();
  if (productCount > 0 && !force) {
    return; // Ya inicializado
  }

  await db.transaction('rw', [db.products, db.rooms, db.sales, db.transactions, db.businessConfig], async () => {
    if (force) {
      await db.products.clear();
      await db.rooms.clear();
      await db.sales.clear();
      await db.transactions.clear();
      await db.businessConfig.clear();
    }

    await db.businessConfig.add(initialConfig);
    await db.products.bulkAdd(initialProducts);
    await db.rooms.bulkAdd(initialRooms);

    const { sales, transactions } = generateSeedHistoricalData();
    await db.sales.bulkAdd(sales);
    await db.transactions.bulkAdd(transactions);
  });
}
