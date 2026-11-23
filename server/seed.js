import bcrypt from 'bcryptjs';
import { User } from './models/User.js';
import { Product } from './models/Product.js';
import { Room } from './models/Room.js';
import { Order } from './models/Order.js';
import { Transaction } from './models/Transaction.js';
import { BusinessConfig } from './models/BusinessConfig.js';

const FOOD_IMAGES = {
  talla: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80',
  camaron: 'https://images.unsplash.com/photo-1559742811-822873691df8?auto=format&fit=crop&w=600&q=80',
  langosta: 'https://images.unsplash.com/photo-1553659971-f01207815844?auto=format&fit=crop&w=600&q=80',
  pulpo: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80',
  coctel: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80',
  ceviche: 'https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?auto=format&fit=crop&w=600&q=80',
  caldo: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80',
  tiritas: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
  quesadillas: 'https://images.unsplash.com/photo-1618040996337-56904b7850b9?auto=format&fit=crop&w=600&q=80',
  chilate: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80',
  coco: 'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?auto=format&fit=crop&w=600&q=80',
  cerveza: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=600&q=80',
  michelada: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=600&q=80',
  refresco: 'https://images.unsplash.com/photo-1581006852262-e4307cf6283a?auto=format&fit=crop&w=600&q=80',
  hielo: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80',
  postre: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80',
};

const ROOM_IMAGES = {
  cabana: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=700&q=80',
  doble: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=700&q=80',
  sencilla: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=700&q=80',
  familiar: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=700&q=80',
};

export async function seedDatabase(force = false) {
  const existingConfig = await BusinessConfig.countDocuments();
  if (existingConfig > 0 && !force) {
    return { seeded: false, message: 'Base de datos ya inicializada.' };
  }

  if (force) {
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Room.deleteMany({}),
      Order.deleteMany({}),
      Transaction.deleteMany({}),
      BusinessConfig.deleteMany({}),
    ]);
  }

  // 1. Configuración del negocio
  await BusinessConfig.create({
    businessName: 'Ramada & Cabañas Las Brisas',
    tagline: 'Cocina Costeña Frente al Mar · Playa Ventura',
    ownerName: 'Rosaura Mendoza y Familia',
    phone: '741 123 4567',
    whatsapp: '527411234567',
    address: 'Playa Ventura, Zona de Ramadas #14',
    municipio: 'Copala',
    state: 'Guerrero',
    rfc: 'MEPR780512AB3',
    taxRegime: '626 - Régimen Simplificado de Confianza (RESICO)',
    ivaRate: 0.16,
    wifiName: 'LasBrisas_Playa_WiFi',
    wifiPassword: 'costachica2026',
    currency: 'MXN',
    thermalPaperWidth: '80mm',
  });

  // 2. Usuarios y Roles con PIN táctil de 4 dígitos
  const [adminPin, cajeroPin, meseroPin, cocinaPin, recepcionPin] = await Promise.all([
    bcrypt.hash('1234', 10),
    bcrypt.hash('2222', 10),
    bcrypt.hash('3333', 10),
    bcrypt.hash('4444', 10),
    bcrypt.hash('5555', 10),
  ]);

  await User.insertMany([
    { name: 'Rosaura Mendoza', role: 'admin', pinHash: adminPin, shift: 'Dirección General' },
    { name: 'Carlos Ramírez', role: 'cajero', pinHash: cajeroPin, shift: 'Caja Principal' },
    { name: 'Antonio Morales', role: 'mesero', pinHash: meseroPin, shift: 'Zona Playa y Ramadas' },
    { name: 'Guadalupe Silva', role: 'mesero', pinHash: meseroPin, shift: 'Palapa Central' },
    { name: 'Chef Martín Cruz', role: 'cocina', pinHash: cocinaPin, shift: 'Brasas y Cocina' },
    { name: 'Elena Vargas', role: 'recepcion', pinHash: recepcionPin, shift: 'Recepción Cabañas' },
  ]);

  // 3. Catálogo de Productos con fotografía real y estación KDS
  const createdProducts = await Product.insertMany([
    {
      name: 'Pescado a la Talla (Huachinango entero)',
      category: 'Especialidades del Mar',
      station: 'cocina',
      price: 320,
      costPrice: 140,
      stock: 18,
      minStock: 10,
      unit: 'kg',
      imageUrl: FOOD_IMAGES.talla,
      description: 'Asado a las brasas de encino con adobo tradicional costeño, ensalada fresca y tortillas hechas a mano.',
    },
    {
      name: 'Camarones al Mojo de Ajo',
      category: 'Pescados y Mariscos',
      station: 'cocina',
      price: 260,
      costPrice: 110,
      stock: 24,
      minStock: 12,
      unit: 'orden',
      imageUrl: FOOD_IMAGES.camaron,
      description: 'Camarones frescos de la costa salteados en mantequilla y ajo dorado, con arroz blanco y frijoles negros.',
    },
    {
      name: 'Langosta Fresca a la Mantequilla',
      category: 'Especialidades del Mar',
      station: 'cocina',
      price: 480,
      costPrice: 220,
      stock: 6,
      minStock: 5,
      unit: 'orden',
      imageUrl: FOOD_IMAGES.langosta,
      description: 'Captura artesanal de Marquelia, horneada a las brasas con mantequilla de hierbas y limón criollo.',
    },
    {
      name: 'Pulpo Enamorado Costeño',
      category: 'Especialidades del Mar',
      station: 'fria',
      price: 290,
      costPrice: 120,
      stock: 9,
      minStock: 6,
      unit: 'orden',
      imageUrl: FOOD_IMAGES.pulpo,
      description: 'Pulpo suave con aderezo cremoso de chipotle, cebolla morada, apio fresco y galletas saladas.',
    },
    {
      name: 'Coctel Campechano (Camarón y Pulpo)',
      category: 'Pescados y Mariscos',
      station: 'fria',
      price: 190,
      costPrice: 75,
      stock: 14,
      minStock: 8,
      unit: 'orden',
      imageUrl: FOOD_IMAGES.coctel,
      description: 'Copa fría de camarón y pulpo en salsa coctelera de la casa con aguacate hass y cilantro.',
    },
    {
      name: 'Ceviche Costeño Mixto',
      category: 'Pescados y Mariscos',
      station: 'fria',
      price: 180,
      costPrice: 70,
      stock: 15,
      minStock: 8,
      unit: 'orden',
      imageUrl: FOOD_IMAGES.ceviche,
      description: 'Pescado del día y camarón curtido en limón costeño, jitomate, cebolla morada, chile verde y aguacate.',
    },
    {
      name: 'Caldo de Camarón y Pescado',
      category: 'Pescados y Mariscos',
      station: 'cocina',
      price: 210,
      costPrice: 85,
      stock: 11,
      minStock: 6,
      unit: 'plato',
      imageUrl: FOOD_IMAGES.caldo,
      description: 'Consomé tradicional de mariscos con verduras locales, epazote fresco y toque de chile guajillo.',
    },
    {
      name: 'Tiritas de Pescado Marinadas',
      category: 'Botanas y Antojitos',
      station: 'fria',
      price: 160,
      costPrice: 65,
      stock: 20,
      minStock: 8,
      unit: 'orden',
      imageUrl: FOOD_IMAGES.tiritas,
      description: 'Láminas finas de pescado fresco marinadas con limón criollo, cebolla morada y orégano de la sierra.',
    },
    {
      name: 'Quesadillas de Camarón con Queso Cincho',
      category: 'Botanas y Antojitos',
      station: 'cocina',
      price: 130,
      costPrice: 50,
      stock: 18,
      minStock: 8,
      unit: 'orden',
      imageUrl: FOOD_IMAGES.quesadillas,
      description: 'Tres piezas de masa fresca rellenas de camarón guisado con queso artesanal costeño.',
    },
    {
      name: 'Chilate Costeño Espumoso con Pan de Huevo',
      category: 'Bebidas y Chilate',
      station: 'barra',
      price: 55,
      costPrice: 18,
      stock: 35,
      minStock: 15,
      unit: 'vaso',
      imageUrl: FOOD_IMAGES.chilate,
      description: 'Bebida tradicional de cacao, arroz y canela servida fría con abundante espuma artesanal.',
    },
    {
      name: 'Agua de Coco Frío Natural',
      category: 'Bebidas y Chilate',
      station: 'barra',
      price: 45,
      costPrice: 15,
      stock: 30,
      minStock: 12,
      unit: 'pza',
      imageUrl: FOOD_IMAGES.coco,
      description: 'Coco verde de palma cortado al momento, servido frío con pulpa tierna.',
    },
    {
      name: 'Cerveza Corona / Victoria Media',
      category: 'Bebidas y Chilate',
      station: 'barra',
      price: 40,
      costPrice: 21,
      stock: 22,
      minStock: 36,
      unit: 'pza',
      imageUrl: FOOD_IMAGES.cerveza,
      description: 'Cerveza bien fría de 355 ml; opción con vaso escarchado con sal y limón.',
    },
    {
      name: 'Michelada Preparada con Camarón Seco',
      category: 'Bebidas y Chilate',
      station: 'barra',
      price: 85,
      costPrice: 38,
      stock: 16,
      minStock: 10,
      unit: 'vaso',
      imageUrl: FOOD_IMAGES.michelada,
      description: 'Tarro frío con clamato, salsas negras, limón costeño, chamoy y camarón seco.',
    },
    {
      name: 'Refresco Yoli / Coca-Cola Vidrio',
      category: 'Bebidas y Chilate',
      station: 'barra',
      price: 35,
      costPrice: 16,
      stock: 28,
      minStock: 15,
      unit: 'pza',
      imageUrl: FOOD_IMAGES.refresco,
      description: 'Botella de vidrio 355 ml servida bien fría.',
    },
    {
      name: 'Bolsa de Hielo 5 kg',
      category: 'Bebidas y Chilate',
      station: 'barra',
      price: 35,
      costPrice: 22,
      stock: 2,
      minStock: 8,
      unit: 'bolsa',
      imageUrl: FOOD_IMAGES.hielo,
      description: 'Insumo crítico para hieleras de barra y enfriamiento de bebidas.',
    },
    {
      name: 'Plátanos Machos Fritos con Crema y Queso',
      category: 'Postres y Cocos',
      station: 'cocina',
      price: 65,
      costPrice: 22,
      stock: 14,
      minStock: 5,
      unit: 'orden',
      imageUrl: FOOD_IMAGES.postre,
      description: 'Plátano macho maduro dorado en mantequilla con crema de rancho y queso fresco.',
    },
  ]);

  // 4. Cuartos y Cabañas
  await Room.insertMany([
    {
      number: '1',
      name: 'Cabaña 1 - Brisa Marina',
      type: 'Cabaña Frente al Mar',
      pricePerNight: 950,
      status: 'ocupada',
      guestName: 'Familia Gómez Rivera',
      guestPhone: '744 555 1290',
      checkInDate: new Date().toISOString().split('T')[0],
      checkOutDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
      capacity: 4,
      imageUrl: ROOM_IMAGES.cabana,
      amenities: ['Vista al mar', 'Hamacas', 'Aire acondicionado', 'Wi-Fi'],
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
      checkInDate: new Date().toISOString().split('T')[0],
      checkOutDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      capacity: 4,
      imageUrl: ROOM_IMAGES.cabana,
      amenities: ['Vista al mar', 'Terraza privada', 'Ventilador', 'Wi-Fi'],
      notes: 'Check-out programado 12:00 PM.',
    },
    {
      number: '3',
      name: 'Cuarto 3 - Puesta de Sol',
      type: 'Doble',
      pricePerNight: 700,
      status: 'libre',
      capacity: 2,
      imageUrl: ROOM_IMAGES.doble,
      amenities: ['2 Camas matrimoniales', 'Aire acondicionado', 'Baño privado'],
    },
    {
      number: '4',
      name: 'Cuarto 4 - Caracol',
      type: 'Sencilla',
      pricePerNight: 550,
      status: 'libre',
      capacity: 2,
      imageUrl: ROOM_IMAGES.sencilla,
      amenities: ['Cama Queen', 'Ventilador de techo', 'Wi-Fi'],
    },
    {
      number: '5',
      name: 'Cuarto 5 - Barra de Tecoanapa',
      type: 'Doble',
      pricePerNight: 700,
      status: 'limpieza',
      capacity: 2,
      imageUrl: ROOM_IMAGES.doble,
      amenities: ['2 Camas matrimoniales', 'Aire acondicionado', 'Balcón'],
      notes: 'Sábanas cambiadas, pendiente sanitización de baño.',
    },
    {
      number: '6',
      name: 'Cuarto 6 - Bocana',
      type: 'Doble',
      pricePerNight: 700,
      status: 'libre',
      capacity: 2,
      imageUrl: ROOM_IMAGES.doble,
      amenities: ['2 Camas matrimoniales', 'Ventilador', 'Wi-Fi'],
    },
    {
      number: '7',
      name: 'Cabaña 7 - Coral Costeño',
      type: 'Familiar',
      pricePerNight: 1200,
      status: 'reservada',
      guestName: 'Roberto Silva (Reserva WhatsApp)',
      guestPhone: '747 987 6543',
      checkInDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      checkOutDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      capacity: 6,
      imageUrl: ROOM_IMAGES.familiar,
      amenities: ['Vista al mar', '3 Camas', 'Aire acondicionado', 'Estacionamiento'],
      notes: 'Anticipo 50% confirmado vía transferencia SPEI.',
    },
    {
      number: '8',
      name: 'Cuarto 8 - El Faro',
      type: 'Sencilla',
      pricePerNight: 550,
      status: 'ocupada',
      guestName: 'Carlos Domínguez',
      guestPhone: '741 234 8901',
      checkInDate: new Date().toISOString().split('T')[0],
      checkOutDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      capacity: 2,
      imageUrl: ROOM_IMAGES.sencilla,
      amenities: ['Cama Queen', 'Aire acondicionado', 'Wi-Fi'],
    },
  ]);

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // 5. Órdenes abiertas en Cocina / Mesas activas
  await Order.insertMany([
    {
      folio: `TCC-${todayStr.replace(/-/g, '')}-001`,
      tableOrRamada: 'Ramada 3 (Playa)',
      guestCount: 4,
      waiterName: 'Antonio Morales',
      items: [
        {
          productId: createdProducts[0]._id.toString(),
          name: createdProducts[0].name,
          quantity: 2,
          price: 320,
          costPrice: 140,
          subtotal: 640,
          station: 'cocina',
          notes: 'Bien dorado a las brasas, mayonesa aparte',
        },
        {
          productId: createdProducts[9]._id.toString(),
          name: createdProducts[9].name,
          quantity: 3,
          price: 55,
          costPrice: 18,
          subtotal: 165,
          station: 'barra',
          notes: 'Con bastante hielo',
        },
      ],
      subtotal: 805,
      tax: 0,
      tip: 0,
      total: 805,
      costTotal: 334,
      status: 'pendiente',
      dateString: todayStr,
      notes: 'Mesa con niños, traer bebidas primero',
      createdAt: new Date(Date.now() - 4 * 60000),
    },
    {
      folio: `TCC-${todayStr.replace(/-/g, '')}-002`,
      tableOrRamada: 'Mesa 2 (Palapa)',
      guestCount: 2,
      waiterName: 'Guadalupe Silva',
      items: [
        {
          productId: createdProducts[2]._id.toString(),
          name: createdProducts[2].name,
          quantity: 1,
          price: 480,
          costPrice: 220,
          subtotal: 480,
          station: 'cocina',
          notes: 'Poco ajo',
        },
        {
          productId: createdProducts[12]._id.toString(),
          name: createdProducts[12].name,
          quantity: 2,
          price: 85,
          costPrice: 38,
          subtotal: 170,
          station: 'barra',
          notes: 'Escarchado con sal y limón',
        },
      ],
      subtotal: 650,
      tax: 0,
      tip: 0,
      total: 650,
      costTotal: 296,
      status: 'en_preparacion',
      dateString: todayStr,
      createdAt: new Date(Date.now() - 12 * 60000),
    },
    {
      folio: `TCC-${todayStr.replace(/-/g, '')}-003`,
      tableOrRamada: 'Ramada 1 (Playa)',
      guestCount: 3,
      waiterName: 'Antonio Morales',
      items: [
        {
          productId: createdProducts[3]._id.toString(),
          name: createdProducts[3].name,
          quantity: 1,
          price: 290,
          costPrice: 120,
          subtotal: 290,
          station: 'fria',
        },
        {
          productId: createdProducts[5]._id.toString(),
          name: createdProducts[5].name,
          quantity: 1,
          price: 180,
          costPrice: 70,
          subtotal: 180,
          station: 'fria',
          notes: 'Aguacate extra',
        },
      ],
      subtotal: 470,
      tax: 0,
      tip: 0,
      total: 470,
      costTotal: 190,
      status: 'listo',
      dateString: todayStr,
      createdAt: new Date(Date.now() - 18 * 60000),
    },
  ]);

  // 6. Ventas cerradas de hoy + Transacciones + Histórico de 28 días para gráficas e IA
  const paidOrders = [];
  const transactions = [];

  const todaySalesSeeds = [
    { hoursAgo: 6, dest: 'Ramada 4 (Playa)', total: 1080, method: 'efectivo', prodIdx: 0, qty: 2 },
    { hoursAgo: 4, dest: 'Mesa 4 (Palapa)', total: 835, method: 'tarjeta', prodIdx: 1, qty: 2 },
    { hoursAgo: 3, dest: 'Ramada 2 (Playa)', total: 990, method: 'transferencia', prodIdx: 4, qty: 3 },
    { hoursAgo: 2, dest: 'Para Llevar', total: 560, method: 'efectivo', prodIdx: 11, qty: 6 },
  ];

  todaySalesSeeds.forEach((s, idx) => {
    const dt = new Date(today.getTime() - s.hoursAgo * 3600000);
    const folio = `TCC-${todayStr.replace(/-/g, '')}-C0${idx + 1}`;
    const prod = createdProducts[s.prodIdx];
    paidOrders.push({
      folio,
      tableOrRamada: s.dest,
      guestCount: 3,
      waiterName: 'Carlos Ramírez',
      items: [
        {
          productId: prod._id.toString(),
          name: prod.name,
          quantity: s.qty,
          price: prod.price,
          costPrice: prod.costPrice,
          subtotal: s.total,
          station: prod.station,
        },
      ],
      subtotal: s.total,
      tax: 0,
      tip: Math.round(s.total * 0.1),
      total: s.total,
      costTotal: Math.round(s.total * 0.42),
      status: 'cobrado',
      paymentMethod: s.method,
      amountPaid: s.total,
      change: 0,
      dateString: todayStr,
      createdAt: dt,
      paidAt: dt,
    });

    transactions.push({
      date: dt,
      dateString: todayStr,
      type: 'ingreso',
      category: 'Venta POS',
      amount: s.total,
      description: `Venta ${folio} - ${s.dest}`,
      paymentMethod: s.method,
      referenceId: folio,
      userName: 'Carlos Ramírez',
    });
  });

  // Ingreso hospedaje hoy
  transactions.push({
    date: new Date(today.getTime() - 5 * 3600000),
    dateString: todayStr,
    type: 'ingreso',
    category: 'Hospedaje',
    amount: 1900,
    description: 'Hospedaje Cabaña 1 - Brisa Marina (2 noches) - Familia Gómez Rivera',
    paymentMethod: 'transferencia',
    userName: 'Elena Vargas',
  });

  // Egresos de hoy
  const todayExpenses = [
    { hoursAgo: 7, category: 'Pescado y Marisco Fresco', amount: 850, desc: 'Compra de 6 kg de huachinango fresco a lancha local' },
    { hoursAgo: 5, category: 'Hielo y Bebidas', amount: 140, desc: 'Compra de 5 bolsas de hielo a repartidor' },
    { hoursAgo: 4, category: 'Carbón y Leña', amount: 180, desc: '2 costales de carbón de encino para brasas' },
    { hoursAgo: 3, category: 'Abarrotes y Verduras', amount: 220, desc: 'Limón criollo, cebolla morada y aguacates del mercado' },
    { hoursAgo: 2, category: 'Gas', amount: 450, desc: 'Recarga de tanque de gas 30 kg cocina' },
  ];

  todayExpenses.forEach((e) => {
    transactions.push({
      date: new Date(today.getTime() - e.hoursAgo * 3600000),
      dateString: todayStr,
      type: 'egreso',
      category: e.category,
      amount: e.amount,
      description: e.desc,
      paymentMethod: 'efectivo',
      userName: 'Rosaura Mendoza',
    });
  });

  // Histórico de 28 días para gráficas y motor IA explicable
  for (let i = 1; i <= 28; i++) {
    const pastDate = new Date(today.getTime() - i * 86400000);
    const pastStr = pastDate.toISOString().split('T')[0];
    const dow = pastDate.getDay();

    let baseAmount = 3200;
    if (dow === 0) baseAmount = 10400;
    else if (dow === 6) baseAmount = 8600;
    else if (dow === 5) baseAmount = 5400;
    else if (dow === 1) baseAmount = 4250;

    const finalAmount = Math.round(baseAmount * (0.92 + Math.random() * 0.16));
    const method = i % 3 === 0 ? 'tarjeta' : i % 2 === 0 ? 'transferencia' : 'efectivo';
    const folio = `TCC-${pastStr.replace(/-/g, '')}-H01`;
    const prod = createdProducts[i % 6];

    paidOrders.push({
      folio,
      tableOrRamada: 'Servicio General',
      guestCount: 4,
      waiterName: 'Antonio Morales',
      items: [
        {
          productId: prod._id.toString(),
          name: prod.name,
          quantity: Math.max(2, Math.floor(finalAmount / prod.price)),
          price: prod.price,
          costPrice: prod.costPrice,
          subtotal: finalAmount,
          station: prod.station,
        },
      ],
      subtotal: finalAmount,
      tax: 0,
      tip: 0,
      total: finalAmount,
      costTotal: Math.round(finalAmount * 0.4),
      status: 'cobrado',
      paymentMethod: method,
      amountPaid: finalAmount,
      change: 0,
      dateString: pastStr,
      createdAt: pastDate,
      paidAt: pastDate,
    });

    transactions.push({
      date: pastDate,
      dateString: pastStr,
      type: 'ingreso',
      category: 'Venta POS',
      amount: finalAmount,
      description: `Cierre de ventas del día ${pastStr}`,
      paymentMethod: method,
      referenceId: folio,
      userName: 'Carlos Ramírez',
    });

    transactions.push({
      date: pastDate,
      dateString: pastStr,
      type: 'egreso',
      category: 'Pescado y Marisco Fresco',
      amount: Math.round(finalAmount * 0.36),
      description: `Abasto de mariscos e insumos ${pastStr}`,
      paymentMethod: 'efectivo',
      userName: 'Rosaura Mendoza',
    });
  }

  await Order.insertMany(paidOrders);
  await Transaction.insertMany(transactions);

  return { seeded: true, message: 'Base de datos MongoDB inicializada con datos comerciales de Costa Chica.' };
}
