import type { Transaction } from '../types';

/**
 * Exportador de datos para el contador / Control RESICO (SAT)
 * Incluye UTF-8 BOM para que Excel en español abra acentos y símbolos correctamente.
 */
export function exportTransactionsToCSV(transactions: Transaction[], startDate?: string, endDate?: string) {
  let filtered = transactions;
  if (startDate && endDate) {
    filtered = transactions.filter(t => t.dateString >= startDate && t.dateString <= endDate);
  }

  // Encabezados del reporte contable
  const headers = [
    'Fecha',
    'Hora',
    'Tipo (Ingreso/Egreso)',
    'Categoría',
    'Descripción',
    'Forma de Pago',
    'Monto (MXN)'
  ];

  const rows = filtered.map(t => {
    const dateObj = new Date(t.date);
    const timeStr = dateObj.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    const escapeCsv = (str: string) => `"${str.replace(/"/g, '""')}"`;

    return [
      t.dateString,
      timeStr,
      t.type.toUpperCase(),
      escapeCsv(t.category),
      escapeCsv(t.description),
      escapeCsv(t.paymentMethod.toUpperCase()),
      t.amount.toFixed(2)
    ].join(',');
  });

  const totalIngresos = filtered.filter(t => t.type === 'ingreso').reduce((a, b) => a + b.amount, 0);
  const totalEgresos = filtered.filter(t => t.type === 'egreso').reduce((a, b) => a + b.amount, 0);
  const utilidadNeta = totalIngresos - totalEgresos;

  // Filas de resumen al final
  rows.push('');
  rows.push(`,,,,,TOTAL INGRESOS:,${totalIngresos.toFixed(2)}`);
  rows.push(`,,,,,TOTAL EGRESOS:,${totalEgresos.toFixed(2)}`);
  rows.push(`,,,,,UTILIDAD NETA:,${utilidadNeta.toFixed(2)}`);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const filename = `TimonCostaChica_Reporte_Contador_${startDate || 'historico'}_${endDate || ''}.csv`;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
