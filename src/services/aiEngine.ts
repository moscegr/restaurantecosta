import { db } from '../db/db';
import type { AIRecommendation } from '../types';

const DAYS_ES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

/**
 * Motor de Inteligencia Artificial Ligera y Explicable
 * Basado en Promedios Estacionales por Día de la Semana y Suavizamiento Exponencial
 * (Slide 20 y 22 del Protocolo de Investigación "Timón Costa Chica")
 */
export async function generateAIInsights(targetDate: Date = new Date()): Promise<AIRecommendation[]> {
  const recommendations: AIRecommendation[] = [];

  const targetDateStr = targetDate.toISOString().split('T')[0];
  const dayOfWeekIndex = targetDate.getDay();
  const currentDayName = DAYS_ES[dayOfWeekIndex];

  // Fecha de mañana
  const tomorrow = new Date(targetDate.getTime() + 24 * 3600000);
  const tomorrowDayIndex = tomorrow.getDay();
  const tomorrowDayName = DAYS_ES[tomorrowDayIndex];

  // 1. Obtener todas las ventas y productos
  const allSales = await db.sales.toArray();
  const allProducts = await db.products.where('active').equals(1).toArray();

  // Ventas de hoy
  const todaySales = allSales.filter(s => s.dateString === targetDateStr && s.status === 'completada');
  const todayIncome = todaySales.reduce((acc, s) => acc + s.total, 0);

  // Ventas del mismo día de la semana pasada (hace 7 días)
  const lastWeekDate = new Date(targetDate.getTime() - 7 * 24 * 3600000);
  const lastWeekDateStr = lastWeekDate.toISOString().split('T')[0];
  const lastWeekSales = allSales.filter(s => s.dateString === lastWeekDateStr && s.status === 'completada');
  const lastWeekIncome = lastWeekSales.reduce((acc, s) => acc + s.total, 0);

  // 2. Insight 1: Comparativa contra la semana pasada
  if (lastWeekIncome > 0) {
    const diffPercent = Math.round(((todayIncome - lastWeekIncome) / lastWeekIncome) * 100);
    const isHigher = diffPercent >= 0;
    recommendations.push({
      id: 'insight-today-comparison',
      type: 'performance_insight',
      title: `Comparativa de ${currentDayName}`,
      description: `Hoy llevas $${todayIncome.toLocaleString('es-MX')} de ingresos (${Math.abs(diffPercent)}% ${isHigher ? 'más' : 'menos'} que el ${currentDayName} pasado).`,
      rationale: `Comparado con $${lastWeekIncome.toLocaleString('es-MX')} registrados el ${currentDayName} de la semana anterior (${lastWeekDateStr}).`,
      urgency: 'info',
    });
  }

  // 3. Insight 2: Pronóstico para mañana (Promedio de los últimos 4 días equivalentes)
  const pastMatchingDays: number[] = [];
  for (let w = 1; w <= 4; w++) {
    const pastMatchingDate = new Date(tomorrow.getTime() - (w * 7) * 24 * 3600000);
    const pStr = pastMatchingDate.toISOString().split('T')[0];
    const daySales = allSales.filter(s => s.dateString === pStr && s.status === 'completada');
    const dayTotal = daySales.reduce((sum, s) => sum + s.total, 0);
    if (dayTotal > 0) {
      pastMatchingDays.push(dayTotal);
    }
  }

  let tomorrowForecast = 0;
  if (pastMatchingDays.length > 0) {
    const sum = pastMatchingDays.reduce((a, b) => a + b, 0);
    tomorrowForecast = Math.round(sum / pastMatchingDays.length);
    recommendations.push({
      id: 'forecast-tomorrow',
      type: 'forecast',
      title: `Pronóstico para mañana ${tomorrowDayName}`,
      description: `Mañana ${tomorrowDayName} se espera cerca de $${tomorrowForecast.toLocaleString('es-MX')} en ingresos.`,
      rationale: `Calculado con el promedio de los últimos ${pastMatchingDays.length} ${tomorrowDayName}s registrados ($${pastMatchingDays.map(v => '$' + v.toLocaleString()).join(', ')}).`,
      urgency: 'info',
      suggestedAction: {
        label: 'Ver Punto de Venta',
        actionType: 'view_pos',
      },
    });
  }

  // 4. Insight 3: Sugerencias de compras inteligentes de Inventario con su "porqué"
  // Revisamos cada producto, especialmente cervezas, hielo, mariscos
  for (const product of allProducts) {
    if (!product.id) continue;

    // Calcular consumo promedio del producto para el día de mañana (ej. lunes)
    // Buscamos cuántas piezas se vendieron en los días anteriores que coincidían con mañana
    let totalQtySold = 0;
    let occurrences = 0;

    for (let w = 1; w <= 4; w++) {
      const pastMatchingDate = new Date(tomorrow.getTime() - (w * 7) * 24 * 3600000);
      const pStr = pastMatchingDate.toISOString().split('T')[0];
      const daySales = allSales.filter(s => s.dateString === pStr && s.status === 'completada');
      for (const sale of daySales) {
        for (const item of sale.items) {
          if (item.productId === product.id) {
            totalQtySold += item.quantity;
          }
        }
      }
      occurrences++;
    }

    const avgDailyUse = occurrences > 0 ? (totalQtySold / occurrences) : 1;
    const roundedAvg = Math.round(avgDailyUse * 10) / 10;

    // Si el stock actual es menor al mínimo o insuficiente para mañana
    if (product.stock <= product.minStock || product.stock < roundedAvg) {
      const neededQty = Math.max(product.minStock - product.stock + Math.ceil(roundedAvg), 1);
      
      const isIceOrBeer = product.name.toLowerCase().includes('hielo') || product.name.toLowerCase().includes('cerveza');
      const urgency = (product.stock <= 2 || (isIceOrBeer && product.stock <= 4)) ? 'alert' : 'warning';

      recommendations.push({
        id: `inventory-suggestion-${product.id}`,
        type: 'inventory_alert',
        title: `Sugerencia de compra: ${product.name}`,
        description: `Compra ${neededQty} ${product.unit} de ${product.name} para mañana.`,
        rationale: `Sueles usar ~${roundedAvg} ${product.unit} los ${tomorrowDayName}s; tienes ${product.stock} ${product.unit} y tu stock mínimo fijado es ${product.minStock} ${product.unit}.`,
        urgency: urgency,
        suggestedAction: {
          label: `Comprar ${neededQty} ${product.unit}`,
          actionType: 'restock',
          payload: {
            productId: product.id,
            suggestedQty: neededQty,
            productName: product.name,
            estimatedCost: neededQty * product.costPrice,
          },
        },
      });
    }
  }

  // Ordenar: Alertas críticas primero, luego pronósticos e insights
  return recommendations.sort((a, b) => {
    const priority = { alert: 0, warning: 1, info: 2 };
    return priority[a.urgency] - priority[b.urgency];
  });
}
