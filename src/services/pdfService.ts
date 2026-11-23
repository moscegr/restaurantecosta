import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { BusinessConfig, InvoiceData, Order } from '../types';

/**
 * Genera y descarga una Factura / Comprobante de Consumo en PDF
 * Formato profesional compatible con RESICO (Régimen Simplificado de Confianza - SAT México)
 */
export function generateInvoicePDF(
  order: Order,
  config: BusinessConfig | null,
  customerInvoice?: InvoiceData
) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
  const inv = customerInvoice || order.invoiceData;
  const ivaRate = config?.ivaRate ?? 0.16;

  // Encabezado corporativo azul océano
  doc.setFillColor(11, 57, 84); // #0B3954
  doc.rect(0, 0, 216, 36, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(config?.businessName || 'Ramada & Cabañas Las Brisas', 14, 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(203, 213, 225);
  doc.text(
    `${config?.address || 'Playa Ventura'}, ${config?.municipio || 'Copala'}, ${config?.state || 'Guerrero'}`,
    14,
    22
  );
  doc.text(
    `RFC Emisor: ${config?.rfc || 'XAXX010101000'}   |   ${config?.taxRegime || '626 - RESICO'}`,
    14,
    28
  );
  doc.text(`Tel: ${config?.phone || '741 123 4567'}`, 14, 33);

  // Recuadro de Folio y Fecha
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(142, 8, 60, 22, 2, 2, 'FD');
  doc.setTextColor(11, 57, 84);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(inv?.rfc ? 'FACTURA / COMPROBANTE' : 'NOTA DE CONSUMO', 172, 14, { align: 'center' });
  doc.setFontSize(10);
  doc.text(`Folio: ${order.folio}`, 172, 20, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  const dateFmt = new Date(order.paidAt || order.createdAt).toLocaleString('es-MX');
  doc.text(dateFmt, 172, 26, { align: 'center' });

  // Datos del Receptor / Servicio
  let y = 45;
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Datos del Receptor y Servicio', 14, y);
  doc.setDrawColor(226, 232, 240);
  doc.line(14, y + 2, 202, y + 2);

  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text(`Razón Social / Cliente: ${inv?.razonSocial || 'PÚBLICO EN GENERAL'}`, 14, y);
  doc.text(`Mesa / Ubicación: ${order.tableOrRamada}`, 130, y);

  y += 6;
  doc.text(`RFC Receptor: ${inv?.rfc || 'XAXX010101000'}`, 14, y);
  doc.text(`Atendió: ${order.waiterName}`, 130, y);

  y += 6;
  doc.text(`Uso CFDI: ${inv?.usoCfdi || 'S01 - Sin efectos fiscales'}`, 14, y);
  doc.text(`Forma de Pago: ${(order.paymentMethod || 'Efectivo').toUpperCase()}`, 130, y);

  if (inv?.email) {
    y += 6;
    doc.text(`Correo de envío: ${inv.email}`, 14, y);
  }

  // Tabla de Conceptos
  const tableRows = order.items.map((item) => [
    String(item.quantity),
    item.name + (item.notes ? ` (${item.notes})` : ''),
    `$${item.price.toFixed(2)}`,
    `$${item.subtotal.toFixed(2)}`,
  ]);

  autoTable(doc, {
    startY: y + 8,
    head: [['Cant.', 'Descripción del Concepto', 'Precio Unit.', 'Importe']],
    body: tableRows,
    theme: 'striped',
    headStyles: {
      fillColor: [11, 57, 84],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9.5,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 18 },
      2: { halign: 'right', cellWidth: 32 },
      3: { halign: 'right', cellWidth: 32 },
    },
    margin: { left: 14, right: 14 },
  });

  // Desglose de Impuestos (Precios incluyen IVA en restaurante México)
  const finalY = (doc as any).lastAutoTable.finalY + 8;
  const baseSinIva = order.subtotal / (1 + ivaRate);
  const ivaDesglosado = order.subtotal - baseSinIva;

  const summaryX = 132;
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105);

  doc.text('Subtotal (sin IVA):', summaryX, finalY);
  doc.text(`$${baseSinIva.toFixed(2)}`, 200, finalY, { align: 'right' });

  doc.text(`IVA (${Math.round(ivaRate * 100)}%):`, summaryX, finalY + 6);
  doc.text(`$${ivaDesglosado.toFixed(2)}`, 200, finalY + 6, { align: 'right' });

  let offset = 12;
  if (order.discount > 0) {
    doc.text('Descuento:', summaryX, finalY + offset);
    doc.text(`-$${order.discount.toFixed(2)}`, 200, finalY + offset, { align: 'right' });
    offset += 6;
  }
  if (order.tip > 0) {
    doc.text('Propina / Servicio:', summaryX, finalY + offset);
    doc.text(`$${order.tip.toFixed(2)}`, 200, finalY + offset, { align: 'right' });
    offset += 6;
  }

  doc.setDrawColor(11, 57, 84);
  doc.setLineWidth(0.5);
  doc.line(summaryX, finalY + offset, 202, finalY + offset);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(11, 57, 84);
  doc.text('TOTAL MXN:', summaryX, finalY + offset + 7);
  doc.text(`$${order.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, 200, finalY + offset + 7, {
    align: 'right',
  });

  // Pie de página legal
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(
    'Este documento es una representación impresa de consumo/prefactura generada por Timón Costa Chica.',
    108,
    262,
    { align: 'center' }
  );
  doc.text(
    `${config?.businessName || 'Timón Costa Chica'} · ${config?.municipio || 'Copala'}, Guerrero, México.`,
    108,
    267,
    { align: 'center' }
  );

  doc.save(`Factura_${order.folio}.pdf`);
}

/**
 * Imprime un ticket optimizado para impresora térmica de 58mm o 80mm
 * Abre una ventana de impresión limpia sin chrome de navegador ni emojis.
 */
export function printThermalTicket(
  order: Order,
  config: BusinessConfig | null,
  mode: 'cliente' | 'cocina' = 'cliente',
  paperWidth: '58mm' | '80mm' = '80mm'
) {
  const widthCss = paperWidth === '58mm' ? '54mm' : '74mm';
  const fontSize = paperWidth === '58mm' ? '11px' : '12px';
  const dateStr = new Date(order.paidAt || order.createdAt).toLocaleString('es-MX', {
    dateStyle: 'short',
    timeStyle: 'short',
  });

  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 3px 0; vertical-align: top; font-weight: bold;">${item.quantity}x</td>
        <td style="padding: 3px 4px;">
          <div style="font-weight: 600;">${item.name}</div>
          ${item.notes ? `<div style="font-size: 10px; font-style: italic;">Nota: ${item.notes}</div>` : ''}
        </td>
        ${
          mode === 'cliente'
            ? `<td style="padding: 3px 0; text-align: right; vertical-align: top; font-weight: 600;">$${item.subtotal.toFixed(2)}</td>`
            : ''
        }
      </tr>
    `
    )
    .join('');

  const totalsHtml =
    mode === 'cliente'
      ? `
      <div class="divider"></div>
      <div class="row"><span>Subtotal:</span><span>$${order.subtotal.toFixed(2)}</span></div>
      ${order.discount > 0 ? `<div class="row"><span>Descuento:</span><span>-$${order.discount.toFixed(2)}</span></div>` : ''}
      ${order.tip > 0 ? `<div class="row"><span>Propina:</span><span>$${order.tip.toFixed(2)}</span></div>` : ''}
      <div class="row total"><span>TOTAL MXN:</span><span>$${order.total.toFixed(2)}</span></div>
      <div class="row"><span>Pago:</span><span>${(order.paymentMethod || 'PENDIENTE').toUpperCase()}</span></div>
      ${
        order.paymentMethod === 'efectivo' && order.amountPaid > 0
          ? `<div class="row"><span>Recibido:</span><span>$${order.amountPaid.toFixed(2)}</span></div>
             <div class="row"><span>Cambio:</span><span>$${order.change.toFixed(2)}</span></div>`
          : ''
      }
      <div class="divider"></div>
      <div class="center small">
        Gracias por su preferencia.<br/>
        ${config?.wifiName ? `Wi-Fi: ${config.wifiName} / Clave: ${config.wifiPassword}<br/>` : ''}
        Timon Costa Chica · ${config?.municipio || 'Copala'}, Gro.
      </div>
    `
      : `
      <div class="divider"></div>
      ${order.notes ? `<div style="font-weight: bold; margin: 6px 0;">NOTA MESA: ${order.notes}</div>` : ''}
      <div class="center bold" style="margin-top: 8px;">*** COMANDA DE COCINA ***</div>
    `;

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <title>Ticket ${order.folio}</title>
      <style>
        @page { size: ${paperWidth} auto; margin: 0; }
        body {
          font-family: 'Courier New', Courier, monospace;
          width: ${widthCss};
          margin: 0 auto;
          padding: 4mm 2mm;
          color: #000;
          font-size: ${fontSize};
          line-height: 1.3;
        }
        .center { text-align: center; }
        .bold { font-weight: 700; }
        .title { font-size: 14px; font-weight: 800; text-transform: uppercase; }
        .small { font-size: 10px; }
        .divider { border-top: 1px dashed #000; margin: 6px 0; }
        .row { display: flex; justify-content: space-between; margin: 2px 0; }
        .total { font-size: 14px; font-weight: 800; margin-top: 4px; }
        table { width: 100%; border-collapse: collapse; }
      </style>
    </head>
    <body>
      <div class="center">
        <div class="title">${config?.businessName || 'Ramada Las Brisas'}</div>
        <div class="small">${config?.address || ''}, ${config?.municipio || 'Copala'}, Gro.</div>
        ${config?.rfc && mode === 'cliente' ? `<div class="small">RFC: ${config.rfc}</div>` : ''}
      </div>
      <div class="divider"></div>
      <div class="row"><span>Folio:</span><span class="bold">${order.folio}</span></div>
      <div class="row"><span>Fecha:</span><span>${dateStr}</span></div>
      <div class="row"><span>Mesa:</span><span class="bold">${order.tableOrRamada}</span></div>
      <div class="row"><span>Atiende:</span><span>${order.waiterName}</span></div>
      <div class="divider"></div>
      <table>
        <tbody>${itemsHtml}</tbody>
      </table>
      ${totalsHtml}
      <script>
        window.onload = function() {
          window.print();
          setTimeout(function() { window.close(); }, 400);
        };
      </script>
    </body>
    </html>
  `;

  const printWin = window.open('', '_blank', 'width=360,height=640');
  if (printWin) {
    printWin.document.open();
    printWin.document.write(html);
    printWin.document.close();
  }
}
