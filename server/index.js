import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

import { User } from './models/User.js';
import { Product } from './models/Product.js';
import { Order } from './models/Order.js';
import { Room } from './models/Room.js';
import { Transaction } from './models/Transaction.js';
import { BusinessConfig } from './models/BusinessConfig.js';
import { requireAuth, requireRole, signToken } from './middleware/auth.js';
import { seedDatabase } from './seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/timon_costa_chica';

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Helper to generate unique folio
function generateFolio(dateStr) {
  const random = Math.floor(1000 + Math.random() * 9000);
  return `TCC-${dateStr.replace(/-/g, '')}-${random}`;
}

// ==========================================
// 1. HEALTHCHECK (Coolify & Monitoring)
// ==========================================
app.get('/api/health', (_req, res) => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  res.json({
    ok: mongoose.connection.readyState === 1,
    database: states[mongoose.connection.readyState] || 'unknown',
    timestamp: new Date().toISOString(),
  });
});

// ==========================================
// 2. AUTENTICACIÓN CON PIN Y ROLES (RBAC)
// ==========================================
app.get('/api/auth/staff', async (_req, res) => {
  try {
    const users = await User.find({ active: true }).sort({ role: 1, name: 1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Error cargando personal.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { userId, pin } = req.body;
    if (!userId || !pin) {
      return res.status(400).json({ error: 'Selecciona un usuario e ingresa tu PIN de 4 dígitos.' });
    }
    const user = await User.findById(userId);
    if (!user || !user.active) {
      return res.status(401).json({ error: 'Usuario no encontrado o inactivo.' });
    }
    const valid = await bcrypt.compare(String(pin), user.pinHash);
    if (!valid) {
      return res.status(401).json({ error: 'PIN incorrecto. Verifica e intenta de nuevo.' });
    }
    const token = signToken(user);
    res.json({ token, user: user.toJSON() });
  } catch (err) {
    res.status(500).json({ error: 'Error de autenticación.' });
  }
});

app.get('/api/users', requireAuth, requireRole('admin'), async (_req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch {
    res.status(500).json({ error: 'Error listando usuarios.' });
  }
});

app.post('/api/users', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { name, role, pin, shift } = req.body;
    if (!name || !role || !pin || String(pin).length !== 4) {
      return res.status(400).json({ error: 'Nombre, rol y PIN de 4 dígitos son obligatorios.' });
    }
    const pinHash = await bcrypt.hash(String(pin), 10);
    const created = await User.create({ name, role, pinHash, shift: shift || 'General', active: true });
    res.status(201).json(created);
  } catch {
    res.status(500).json({ error: 'Error creando usuario.' });
  }
});

app.put('/api/users/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { name, role, pin, shift, active } = req.body;
    const update = {};
    if (name !== undefined) update.name = name;
    if (role !== undefined) update.role = role;
    if (shift !== undefined) update.shift = shift;
    if (active !== undefined) update.active = active;
    if (pin && /^\d{4}$/.test(String(pin))) {
      update.pinHash = await bcrypt.hash(String(pin), 10);
    }
    const updated = await User.findByIdAndUpdate(req.params.id, { $set: update }, { new: true });
    if (!updated) return res.status(404).json({ error: 'Usuario no encontrado.' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Error actualizando usuario.' });
  }
});

app.delete('/api/users/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Error eliminando usuario.' });
  }
});

// ==========================================
// 3. PRODUCTOS E INVENTARIO
// ==========================================
app.get('/api/products', async (_req, res) => {
  try {
    const products = await Product.find({ active: true }).sort({ category: 1, name: 1 });
    res.json(products);
  } catch {
    res.status(500).json({ error: 'Error cargando productos.' });
  }
});

app.post('/api/products', requireAuth, requireRole('admin', 'cajero'), async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message || 'Error creando producto.' });
  }
});

app.put('/api/products/:id', requireAuth, requireRole('admin', 'cajero'), async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Producto no encontrado.' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message || 'Error actualizando producto.' });
  }
});

app.delete('/api/products/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, { active: false });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Error eliminando producto.' });
  }
});

app.post('/api/products/:id/restock', requireAuth, requireRole('admin', 'cajero', 'cocina'), async (req, res) => {
  try {
    const { quantity, unitCost, recordExpense, supplierNotes } = req.body;
    const qty = Number(quantity) || 0;
    const cost = Number(unitCost) || 0;
    if (qty <= 0) return res.status(400).json({ error: 'Cantidad inválida.' });

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Producto no encontrado.' });

    product.stock += qty;
    if (cost > 0) product.costPrice = cost;
    await product.save();

    if (recordExpense && cost * qty > 0) {
      const todayStr = new Date().toISOString().split('T')[0];
      const nameLower = product.name.toLowerCase();
      let category = 'Abarrotes y Verduras';
      if (nameLower.includes('pescado') || nameLower.includes('camar') || nameLower.includes('langosta') || nameLower.includes('pulpo')) {
        category = 'Pescado y Marisco Fresco';
      } else if (nameLower.includes('hielo') || nameLower.includes('cerveza') || nameLower.includes('refresco')) {
        category = 'Hielo y Bebidas';
      } else if (nameLower.includes('carb') || nameLower.includes('leña')) {
        category = 'Carbón y Leña';
      }

      await Transaction.create({
        date: new Date(),
        dateString: todayStr,
        type: 'egreso',
        category,
        amount: cost * qty,
        description: `Compra inventario: +${qty} ${product.unit} de ${product.name} (${supplierNotes || 'Proveedor local'})`,
        paymentMethod: 'efectivo',
        userName: req.user.name,
      });
    }

    res.json(product);
  } catch {
    res.status(500).json({ error: 'Error registrando entrada de mercancía.' });
  }
});

// ==========================================
// 4. ÓRDENES, MESAS ABIERTAS, KDS COCINA Y COBRO POS
// ==========================================
app.get('/api/orders', requireAuth, async (req, res) => {
  try {
    const { status, dateString, open } = req.query;
    const filter = {};
    if (open === 'true') {
      filter.status = { $in: ['pendiente', 'en_preparacion', 'listo', 'entregado'] };
    } else if (status) {
      filter.status = { $in: String(status).split(',') };
    }
    if (dateString) {
      filter.dateString = String(dateString);
    }
    const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(200);
    res.json(orders);
  } catch {
    res.status(500).json({ error: 'Error cargando órdenes.' });
  }
});

app.post('/api/orders', requireAuth, requireRole('admin', 'cajero', 'mesero'), async (req, res) => {
  try {
    const {
      tableOrRamada,
      guestCount,
      items,
      notes,
      payImmediately,
      paymentMethod,
      amountPaid,
      tip,
      discount,
      invoiceData,
    } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ error: 'La orden debe contener al menos un producto.' });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const tipAmt = Number(tip) || 0;
    const discountAmt = Number(discount) || 0;
    const total = Math.max(0, subtotal - discountAmt + tipAmt);
    const costTotal = items.reduce((sum, i) => sum + (i.costPrice || 0) * i.quantity, 0);

    const normalizedItems = items.map((i) => ({
      productId: String(i.productId),
      name: i.name,
      quantity: Number(i.quantity),
      price: Number(i.price),
      costPrice: Number(i.costPrice || 0),
      subtotal: Number(i.price) * Number(i.quantity),
      station: i.station || 'cocina',
      notes: i.notes || '',
    }));

    const folio = generateFolio(todayStr);

    const orderDoc = await Order.create({
      folio,
      tableOrRamada: tableOrRamada || 'Venta Directa',
      guestCount: Number(guestCount) || 2,
      waiterId: req.user.id,
      waiterName: req.user.name,
      items: normalizedItems,
      subtotal,
      tax: 0,
      tip: tipAmt,
      discount: discountAmt,
      total,
      costTotal,
      status: payImmediately ? 'cobrado' : 'pendiente',
      paymentMethod: payImmediately ? paymentMethod || 'efectivo' : '',
      amountPaid: payImmediately ? Number(amountPaid) || total : 0,
      change: payImmediately ? Math.max(0, (Number(amountPaid) || total) - total) : 0,
      dateString: todayStr,
      notes: notes || '',
      paidAt: payImmediately ? new Date() : undefined,
      invoiceData: invoiceData || undefined,
    });

    if (payImmediately) {
      // Descontar inventario y registrar ingreso en caja
      for (const item of normalizedItems) {
        if (mongoose.Types.ObjectId.isValid(item.productId)) {
          await Product.findByIdAndUpdate(item.productId, {
            $inc: { stock: -item.quantity },
          });
        }
      }

      await Transaction.create({
        date: new Date(),
        dateString: todayStr,
        type: 'ingreso',
        category: 'Venta POS',
        amount: total,
        description: `Venta ${folio} - ${tableOrRamada || 'Caja'} (${normalizedItems.length} productos)`,
        paymentMethod: paymentMethod || 'efectivo',
        referenceId: folio,
        userName: req.user.name,
      });
    }

    res.status(201).json(orderDoc);
  } catch (err) {
    res.status(400).json({ error: err.message || 'Error creando orden.' });
  }
});

app.put('/api/orders/:id', requireAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Orden no encontrada.' });

    const { status, items, notes, guestCount, tableOrRamada } = req.body;
    if (status) order.status = status;
    if (notes !== undefined) order.notes = notes;
    if (guestCount) order.guestCount = guestCount;
    if (tableOrRamada) order.tableOrRamada = tableOrRamada;

    if (items && Array.isArray(items)) {
      order.items = items.map((i) => ({
        productId: String(i.productId),
        name: i.name,
        quantity: Number(i.quantity),
        price: Number(i.price),
        costPrice: Number(i.costPrice || 0),
        subtotal: Number(i.price) * Number(i.quantity),
        station: i.station || 'cocina',
        notes: i.notes || '',
      }));
      order.subtotal = order.items.reduce((s, i) => s + i.subtotal, 0);
      order.costTotal = order.items.reduce((s, i) => s + i.costPrice * i.quantity, 0);
      order.total = Math.max(0, order.subtotal - (order.discount || 0) + (order.tip || 0));
    }

    await order.save();
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message || 'Error actualizando orden.' });
  }
});

app.post('/api/orders/:id/pay', requireAuth, requireRole('admin', 'cajero', 'mesero'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Orden no encontrada.' });
    if (order.status === 'cobrado') {
      return res.status(400).json({ error: 'Esta orden ya fue cobrada.' });
    }

    const { paymentMethod, amountPaid, tip, discount, invoiceData } = req.body;
    const tipAmt = Number(tip) || 0;
    const discountAmt = Number(discount) || 0;
    const finalTotal = Math.max(0, order.subtotal - discountAmt + tipAmt);
    const paidNum = Number(amountPaid) || finalTotal;

    order.tip = tipAmt;
    order.discount = discountAmt;
    order.total = finalTotal;
    order.paymentMethod = paymentMethod || 'efectivo';
    order.amountPaid = paidNum;
    order.change = order.paymentMethod === 'efectivo' ? Math.max(0, paidNum - finalTotal) : 0;
    order.status = 'cobrado';
    order.paidAt = new Date();
    if (invoiceData) order.invoiceData = invoiceData;

    await order.save();

    // Descontar inventario
    for (const item of order.items) {
      if (mongoose.Types.ObjectId.isValid(item.productId)) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity },
        });
      }
    }

    // Registrar ingreso en Caja/Dinero
    const todayStr = new Date().toISOString().split('T')[0];
    await Transaction.create({
      date: new Date(),
      dateString: todayStr,
      type: 'ingreso',
      category: 'Venta POS',
      amount: finalTotal,
      description: `Cobro cuenta ${order.folio} - ${order.tableOrRamada}`,
      paymentMethod: order.paymentMethod,
      referenceId: order.folio,
      userName: req.user.name,
    });

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Error al cobrar cuenta.' });
  }
});

// ==========================================
// 5. HOSPEDAJE (CUARTOS Y CABAÑAS)
// ==========================================
app.get('/api/rooms', async (_req, res) => {
  try {
    const rooms = await Room.find().sort({ number: 1 });
    res.json(rooms);
  } catch {
    res.status(500).json({ error: 'Error cargando cuartos.' });
  }
});

app.post('/api/rooms', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const created = await Room.create(req.body);
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ error: err.message || 'Error creando habitación.' });
  }
});

app.put('/api/rooms/:id', requireAuth, requireRole('admin', 'recepcion', 'cajero'), async (req, res) => {
  try {
    const updated = await Room.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!updated) return res.status(404).json({ error: 'Cuarto no encontrado.' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message || 'Error actualizando cuarto.' });
  }
});

app.delete('/api/rooms/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    await Room.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Error eliminando cuarto.' });
  }
});

app.post('/api/rooms/:id/checkin', requireAuth, requireRole('admin', 'recepcion', 'cajero'), async (req, res) => {
  try {
    const { guestName, guestPhone, nights, chargeNow, paymentMethod, notes } = req.body;
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ error: 'Cuarto no encontrado.' });

    const nightsNum = Math.max(1, Number(nights) || 1);
    const todayStr = new Date().toISOString().split('T')[0];
    const checkOutStr = new Date(Date.now() + nightsNum * 86400000).toISOString().split('T')[0];

    room.status = 'ocupada';
    room.guestName = guestName;
    room.guestPhone = guestPhone || '';
    room.checkInDate = todayStr;
    room.checkOutDate = checkOutStr;
    room.notes = notes || '';
    await room.save();

    if (chargeNow) {
      await Transaction.create({
        date: new Date(),
        dateString: todayStr,
        type: 'ingreso',
        category: 'Hospedaje',
        amount: room.pricePerNight * nightsNum,
        description: `Hospedaje ${room.name} (${nightsNum} noche/s) - ${guestName}`,
        paymentMethod: paymentMethod || 'efectivo',
        userName: req.user.name,
      });
    }

    res.json(room);
  } catch {
    res.status(500).json({ error: 'Error registrando check-in.' });
  }
});

app.post('/api/rooms/:id/checkout', requireAuth, requireRole('admin', 'recepcion', 'cajero'), async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(
      req.params.id,
      {
        status: 'limpieza',
        guestName: '',
        guestPhone: '',
        checkInDate: '',
        checkOutDate: '',
        notes: 'Limpieza pendiente tras salida de huésped',
      },
      { new: true }
    );
    res.json(room);
  } catch {
    res.status(500).json({ error: 'Error registrando check-out.' });
  }
});

// ==========================================
// 6. FINANZAS, CAJA RESICO, ANALÍTICA Y MOTOR IA EXPLICABLE
// ==========================================
app.get('/api/transactions', requireAuth, async (req, res) => {
  try {
    const { dateString } = req.query;
    const filter = dateString ? { dateString: String(dateString) } : {};
    const list = await Transaction.find(filter).sort({ date: -1 }).limit(500);
    res.json(list);
  } catch {
    res.status(500).json({ error: 'Error cargando transacciones.' });
  }
});

app.post('/api/transactions', requireAuth, requireRole('admin', 'cajero', 'recepcion'), async (req, res) => {
  try {
    const { type, category, amount, description, paymentMethod } = req.body;
    const todayStr = new Date().toISOString().split('T')[0];
    const tx = await Transaction.create({
      date: new Date(),
      dateString: todayStr,
      type,
      category,
      amount: Number(amount),
      description,
      paymentMethod: paymentMethod || 'efectivo',
      userName: req.user.name,
    });
    res.status(201).json(tx);
  } catch (err) {
    res.status(400).json({ error: err.message || 'Error guardando movimiento.' });
  }
});

app.get('/api/analytics', requireAuth, async (_req, res) => {
  try {
    const DAYS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const DAYS_FULL = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const [allTx, allOrders, allProducts, allRooms] = await Promise.all([
      Transaction.find().sort({ date: -1 }).limit(1000),
      Order.find({ status: 'cobrado' }).sort({ createdAt: -1 }).limit(1000),
      Product.find({ active: true }),
      Room.find(),
    ]);

    // 1. Serie de últimos 14 días (Ingresos vs Egresos vs Utilidad)
    const dailyMap = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today.getTime() - i * 86400000);
      const ds = d.toISOString().split('T')[0];
      dailyMap[ds] = {
        date: ds,
        label: `${DAYS_ES[d.getDay()]} ${d.getDate()}`,
        ingresos: 0,
        egresos: 0,
        utilidad: 0,
      };
    }

    allTx.forEach((t) => {
      if (dailyMap[t.dateString]) {
        if (t.type === 'ingreso') dailyMap[t.dateString].ingresos += t.amount;
        else dailyMap[t.dateString].egresos += t.amount;
        dailyMap[t.dateString].utilidad =
          dailyMap[t.dateString].ingresos - dailyMap[t.dateString].egresos;
      }
    });
    const dailySeries = Object.values(dailyMap);

    // 2. Distribución por método de pago (últimos 30 días)
    const paymentMap = { efectivo: 0, tarjeta: 0, transferencia: 0 };
    allTx
      .filter((t) => t.type === 'ingreso')
      .forEach((t) => {
        if (paymentMap[t.paymentMethod] !== undefined) {
          paymentMap[t.paymentMethod] += t.amount;
        }
      });
    const paymentBreakdown = [
      { name: 'Efectivo', value: paymentMap.efectivo },
      { name: 'Tarjeta', value: paymentMap.tarjeta },
      { name: 'Transferencia', value: paymentMap.transferencia },
    ];

    // 3. Top platillos más vendidos
    const prodStats = {};
    allOrders.forEach((o) => {
      o.items.forEach((item) => {
        if (!prodStats[item.name]) {
          prodStats[item.name] = { name: item.name, quantity: 0, revenue: 0 };
        }
        prodStats[item.name].quantity += item.quantity;
        prodStats[item.name].revenue += item.subtotal;
      });
    });
    const topProducts = Object.values(prodStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);

    // 4. Motor IA Ligera Explicable (Promedios por día de semana + stock)
    const aiInsights = [];
    const todayIncome = allTx
      .filter((t) => t.dateString === todayStr && t.type === 'ingreso')
      .reduce((s, t) => s + t.amount, 0);
    const todayExpense = allTx
      .filter((t) => t.dateString === todayStr && t.type === 'egreso')
      .reduce((s, t) => s + t.amount, 0);

    const lastWeekStr = new Date(today.getTime() - 7 * 86400000).toISOString().split('T')[0];
    const lastWeekIncome = allTx
      .filter((t) => t.dateString === lastWeekStr && t.type === 'ingreso')
      .reduce((s, t) => s + t.amount, 0);

    if (lastWeekIncome > 0) {
      const diffPct = Math.round(((todayIncome - lastWeekIncome) / lastWeekIncome) * 100);
      aiInsights.push({
        id: 'ai-comparison',
        type: 'performance_insight',
        title: `Rendimiento del ${DAYS_FULL[today.getDay()]}`,
        description: `Hoy llevas $${todayIncome.toLocaleString('es-MX')} de ingresos (${Math.abs(diffPct)}% ${diffPct >= 0 ? 'más' : 'menos'} que el ${DAYS_FULL[today.getDay()]} pasado).`,
        rationale: `Comparado con $${lastWeekIncome.toLocaleString('es-MX')} registrados el ${lastWeekStr}.`,
        urgency: 'info',
      });
    }

    const tomorrow = new Date(today.getTime() + 86400000);
    const tomorrowName = DAYS_FULL[tomorrow.getDay()];
    const pastMatching = [];
    for (let w = 1; w <= 4; w++) {
      const pStr = new Date(tomorrow.getTime() - w * 7 * 86400000).toISOString().split('T')[0];
      const sum = allTx
        .filter((t) => t.dateString === pStr && t.type === 'ingreso')
        .reduce((a, b) => a + b.amount, 0);
      if (sum > 0) pastMatching.push(sum);
    }

    if (pastMatching.length > 0) {
      const avg = Math.round(pastMatching.reduce((a, b) => a + b, 0) / pastMatching.length);
      aiInsights.push({
        id: 'ai-forecast',
        type: 'forecast',
        title: `Pronóstico para mañana ${tomorrowName}`,
        description: `Se proyectan cerca de $${avg.toLocaleString('es-MX')} MXN en ingresos para mañana ${tomorrowName}.`,
        rationale: `Promedio de los últimos ${pastMatching.length} ${tomorrowName}s registrados (${pastMatching.map((v) => '$' + v.toLocaleString('es-MX')).join(', ')}).`,
        urgency: 'info',
      });
    }

    allProducts.forEach((p) => {
      if (p.stock <= p.minStock) {
        const needed = Math.max(p.minStock - p.stock + 4, 2);
        aiInsights.push({
          id: `ai-stock-${p.id}`,
          type: 'inventory_alert',
          title: `Reabastecer: ${p.name}`,
          description: `Compra ${needed} ${p.unit} de ${p.name} antes del servicio de mañana.`,
          rationale: `Existencia actual: ${p.stock} ${p.unit}. Stock mínimo definido: ${p.minStock} ${p.unit}.`,
          urgency: p.stock <= 3 ? 'alert' : 'warning',
          suggestedAction: { label: `Surtir ${needed} ${p.unit}`, actionType: 'restock', productId: p.id },
        });
      }
    });

    res.json({
      todaySummary: {
        ingresos: todayIncome,
        egresos: todayExpense,
        utilidad: todayIncome - todayExpense,
        occupiedRooms: allRooms.filter((r) => r.status === 'ocupada').length,
        totalRooms: allRooms.length,
        openOrdersCount: await Order.countDocuments({
          status: { $in: ['pendiente', 'en_preparacion', 'listo'] },
        }),
      },
      dailySeries,
      paymentBreakdown,
      topProducts,
      aiInsights,
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Error generando analítica.' });
  }
});

// ==========================================
// 7. CONFIGURACIÓN Y SEED DEMO
// ==========================================
app.get('/api/config', async (_req, res) => {
  try {
    const cfg = await BusinessConfig.findOne();
    res.json(cfg);
  } catch {
    res.status(500).json({ error: 'Error cargando configuración.' });
  }
});

app.put('/api/config', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    let cfg = await BusinessConfig.findOne();
    if (!cfg) {
      cfg = await BusinessConfig.create(req.body);
    } else {
      Object.assign(cfg, req.body);
      await cfg.save();
    }
    res.json(cfg);
  } catch {
    res.status(400).json({ error: 'Error guardando configuración.' });
  }
});

app.post('/api/seed', requireAuth, requireRole('admin'), async (_req, res) => {
  try {
    const result = await seedDatabase(true);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Error restableciendo base de datos.' });
  }
});

// ==========================================
// 8. SERVIR FRONTEND COMPILADO EN PRODUCCIÓN (COOLIFY)
// ==========================================
const distPath = path.resolve(__dirname, '../dist');
app.use(express.static(distPath));
app.get(/^(?!\/api).*/, (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// ==========================================
// INICIO DEL SERVIDOR + CONEXIÓN MONGODB
// ==========================================
async function start() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('[MongoDB] Conectado correctamente a:', MONGODB_URI.replace(/\/\/.*@/, '//***@'));
    const seedRes = await seedDatabase(false);
    if (seedRes.seeded) console.log('[Seed]', seedRes.message);

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[Timón Costa Chica API] Servidor corriendo en puerto ${PORT}`);
    });
  } catch (err) {
    console.error('[MongoDB] Error de conexión:', err.message);
    process.exit(1);
  }
}

start();
