/* SAPPHIRE POS — admin panel */
'use strict';

window.EXTRA_I18N = {
  en: {
    open_pos: 'Open cashier', month_revenue: 'Revenue', vs_last_month: 'vs last month', sales_count: 'Sales',
    avg_ticket: 'Average sale', est_profit: 'Profit (est.)', items_sold: 'Items sold', vat_collected: 'VAT collected',
    revenue_by_day: 'Revenue by day', by_category: 'By category', busiest_hours: 'Busiest hours', top_products: 'Best sellers',
    low_stock: 'Low stock', slow_movers: 'Not selling (30 days)', slow_hint: 'In stock but no sales in the last 30 days',
    payment_methods: 'Payment methods', by_cashier: 'By cashier', inventory: 'Inventory', at_cost: 'Value at cost',
    at_retail: 'Value at retail', units_in_stock: 'Units in stock', products_count: 'Products', out_of_stock_n: 'Out of stock',
    new_product: 'New product', import_csv: 'Import CSV', export_csv: 'Export CSV', print_labels: 'Print labels',
    low_only: 'Low stock only', all_categories: 'All categories', barcode: 'Barcode', name: 'Name', category: 'Category',
    size: 'Size', color: 'Color', cost: 'Cost', stock: 'Stock', min_stock: 'Alert when stock ≤', sold_30d: 'Sold 30d',
    edit: 'Edit', add_stock: 'Stock', history: 'History', delete: 'Delete', generate: 'Generate code',
    barcode_help: 'Scan the product\'s barcode here, or press "Generate code" if it has none (then print a label).',
    description: 'Notes', product_saved: 'Product saved', product_deleted: 'Product deleted',
    product_archived: 'Product hidden (it has sales history)', confirm_delete: 'Delete this product?',
    receive_stock: 'Adjust stock', quantity: 'Quantity (+ add / − remove)', reason: 'Reason', stock_updated: 'Stock updated',
    received: 'Received from supplier', damaged: 'Damaged / lost', count_fix: 'Inventory count correction', returned: 'Customer return',
    labels_title: 'Print labels', copies: 'Copies', label_size: 'Label size', select_products_first: 'Select products first (checkboxes)',
    import_title: 'Import products from CSV', imported: 'Imported: {c} new, {u} updated',
    import_help: 'Excel or Google Sheets → File → Download/Save as CSV. Columns (English or Spanish): barcode, name, category, price, cost, stock, size, color. Existing barcodes are updated; rows without barcode get a new code.',
    choose_file: 'Choose CSV file', today: 'Today', yesterday: 'Yesterday', this_week: 'This week', this_month: 'This month',
    from: 'From', to: 'To', void_sale: 'Void sale', void_reason: 'Reason for voiding', confirm_void: 'Void this sale? Items go back to stock.',
    sale_voided: 'Sale voided', new_user: 'New user', role: 'Role', admin: 'Admin', cashier_role: 'Cashier', active: 'Active',
    inactive: 'Disabled', reset_password: 'New password (leave blank to keep)', user_saved: 'User saved', enable: 'Enable', disable: 'Disable',
    store_info: 'Store & receipt', store_name: 'Store name', tagline: 'Line under the name', address: 'Address', phone: 'Phone',
    receipt_footer: 'Receipt message', return_policy: 'Return policy (on receipt)', taxes: 'VAT', vat_enabled: 'Charge VAT',
    vat_rate: 'VAT rate (%)', prices_include_vat: 'My prices already include VAT', printing: 'Printing', paper_width: 'Receipt paper width',
    auto_print: 'Print receipt automatically after each sale', test_print: 'Print test receipt', inventory_rules: 'Inventory',
    allow_negative: 'Allow selling when stock shows 0 (not recommended)', categories: 'Categories', categories_help: 'Separate with commas',
    settings_saved: 'Settings saved', no_data: 'No data yet', profit_note: 'Profit = sales without VAT − product cost',
    stock_history: 'Stock history', change_col: 'Change', final_col: 'Stock after', user_col: 'By', status: 'Status',
    view: 'View', all: 'All', units: 'units', mm80: '80 mm (standard)', mm58: '58 mm (small)',
    print_guide_title: 'Printing without the print window (thermal printer)',
    print_guide: [
      'Connect the receipt printer and set it as the <b>default printer</b> in Windows (Settings → Printers).',
      'Right-click the Chrome shortcut on the desktop → Properties. At the end of <b>Target</b> add: <code>--kiosk-printing</code> (with a space before). Click OK.',
      'Close <b>all</b> Chrome windows, then open Chrome from that shortcut and go to the POS link.',
      'Press "Print test receipt". It should print right away without asking. If margins look wrong, set Margins: None once in the print window (without the flag).',
    ],
    label_50x25: 'Label printer 50×25 mm', label_40x30: 'Label printer 40×30 mm', label_a4: 'A4 sheet (21 labels, 63.5×38 mm)',
    month_names: 'January,February,March,April,May,June,July,August,September,October,November,December',
    weekdays: 'Mon,Tue,Wed,Thu,Fri,Sat,Sun', select_all: 'Select all', selected: 'selected', search_products: 'Search name, code or category',
  },
  es: {
    open_pos: 'Abrir caja', month_revenue: 'Ventas del mes', vs_last_month: 'vs mes anterior', sales_count: 'Número de ventas',
    avg_ticket: 'Venta promedio', est_profit: 'Ganancia (aprox.)', items_sold: 'Artículos vendidos', vat_collected: 'IVA cobrado',
    revenue_by_day: 'Ventas por día', by_category: 'Por categoría', busiest_hours: 'Horas con más ventas', top_products: 'Lo más vendido',
    low_stock: 'Poco inventario', slow_movers: 'No se venden (30 días)', slow_hint: 'Con inventario pero sin ventas en los últimos 30 días',
    payment_methods: 'Formas de pago', by_cashier: 'Por cajero/a', inventory: 'Inventario', at_cost: 'Valor al costo',
    at_retail: 'Valor a precio de venta', units_in_stock: 'Unidades en inventario', products_count: 'Productos', out_of_stock_n: 'Agotados',
    new_product: 'Nuevo producto', import_csv: 'Importar CSV', export_csv: 'Exportar CSV', print_labels: 'Imprimir etiquetas',
    low_only: 'Solo poco inventario', all_categories: 'Todas las categorías', barcode: 'Código de barras', name: 'Nombre', category: 'Categoría',
    size: 'Talla', color: 'Color', cost: 'Costo', stock: 'Inventario', min_stock: 'Avisar cuando queden ≤', sold_30d: 'Vendidos 30d',
    edit: 'Editar', add_stock: 'Inventario', history: 'Historial', delete: 'Eliminar', generate: 'Generar código',
    barcode_help: 'Escanea aquí el código del producto, o pulsa "Generar código" si no tiene (y luego imprime su etiqueta).',
    description: 'Notas', product_saved: 'Producto guardado', product_deleted: 'Producto eliminado',
    product_archived: 'Producto ocultado (tiene ventas registradas)', confirm_delete: '¿Eliminar este producto?',
    receive_stock: 'Ajustar inventario', quantity: 'Cantidad (+ sumar / − restar)', reason: 'Motivo', stock_updated: 'Inventario actualizado',
    received: 'Llegó mercancía', damaged: 'Dañado / perdido', count_fix: 'Corrección de conteo', returned: 'Devolución de cliente',
    labels_title: 'Imprimir etiquetas', copies: 'Copias', label_size: 'Tamaño de etiqueta', select_products_first: 'Primero marca los productos (casillas)',
    import_title: 'Importar productos desde CSV', imported: 'Importados: {c} nuevos, {u} actualizados',
    import_help: 'En Excel o Google Sheets → Archivo → Descargar/Guardar como CSV. Columnas (inglés o español): codigo, nombre, categoria, precio, costo, cantidad, talla, color. Si el código ya existe se actualiza; filas sin código reciben uno nuevo.',
    choose_file: 'Elegir archivo CSV', today: 'Hoy', yesterday: 'Ayer', this_week: 'Esta semana', this_month: 'Este mes',
    from: 'Desde', to: 'Hasta', void_sale: 'Anular venta', void_reason: 'Motivo de la anulación', confirm_void: '¿Anular esta venta? Los productos vuelven al inventario.',
    sale_voided: 'Venta anulada', new_user: 'Nuevo usuario', role: 'Rol', admin: 'Administrador', cashier_role: 'Cajero/a', active: 'Activo',
    inactive: 'Desactivado', reset_password: 'Contraseña nueva (vacío = no cambiar)', user_saved: 'Usuario guardado', enable: 'Activar', disable: 'Desactivar',
    store_info: 'Tienda y recibo', store_name: 'Nombre de la tienda', tagline: 'Línea debajo del nombre', address: 'Dirección', phone: 'Teléfono',
    receipt_footer: 'Mensaje del recibo', return_policy: 'Política de cambios (en el recibo)', taxes: 'IVA (VAT)', vat_enabled: 'Cobrar IVA',
    vat_rate: 'Tasa de IVA (%)', prices_include_vat: 'Mis precios ya incluyen el IVA', printing: 'Impresión', paper_width: 'Ancho del papel del recibo',
    auto_print: 'Imprimir el recibo automáticamente después de cada venta', test_print: 'Imprimir recibo de prueba', inventory_rules: 'Inventario',
    allow_negative: 'Permitir vender aunque el inventario diga 0 (no recomendado)', categories: 'Categorías', categories_help: 'Separadas por comas',
    settings_saved: 'Ajustes guardados', no_data: 'Todavía no hay datos', profit_note: 'Ganancia = ventas sin IVA − costo de los productos',
    stock_history: 'Historial de inventario', change_col: 'Cambio', final_col: 'Quedó en', user_col: 'Por', status: 'Estado',
    view: 'Ver', all: 'Todos', units: 'unidades', mm80: '80 mm (normal)', mm58: '58 mm (pequeño)',
    print_guide_title: 'Imprimir sin la ventana de impresión (impresora térmica)',
    print_guide: [
      'Conecta la impresora de recibos y ponla como <b>impresora predeterminada</b> en Windows (Configuración → Impresoras).',
      'Clic derecho en el acceso directo de Chrome del escritorio → Propiedades. Al final de <b>Destino</b> agrega: <code>--kiosk-printing</code> (con un espacio antes). Aceptar.',
      'Cierra <b>todas</b> las ventanas de Chrome, abre Chrome desde ese acceso directo y entra al link del POS.',
      'Pulsa "Imprimir recibo de prueba". Debe imprimir de una vez sin preguntar. Si los márgenes salen mal, pon Márgenes: Ninguno una vez en la ventana de impresión (sin el flag).',
    ],
    label_50x25: 'Impresora de etiquetas 50×25 mm', label_40x30: 'Impresora de etiquetas 40×30 mm', label_a4: 'Hoja A4 (21 etiquetas de 63,5×38 mm)',
    month_names: 'Enero,Febrero,Marzo,Abril,Mayo,Junio,Julio,Agosto,Septiembre,Octubre,Noviembre,Diciembre',
    weekdays: 'Lun,Mar,Mié,Jue,Vie,Sáb,Dom', select_all: 'Marcar todos', selected: 'marcados', search_products: 'Buscar nombre, código o categoría',
  },
};
const tl = (k) => { const v = EXTRA_I18N[LANG]?.[k] ?? EXTRA_I18N.en[k]; return v; };

const IC = {
  chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
  box: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M3 7l9-4 9 4-9 4-9-4zM3 7v10l9 4 9-4V7M12 11v10"/></svg>',
  receipt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2h12v20l-3-2-3 2-3-2-3 2V2zM9 7h6M9 11h6M9 15h4"/></svg>',
  users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/></svg>',
  gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
};

let TAB = 'dashboard';
const charts = [];
function killCharts() { while (charts.length) charts.pop().destroy(); }

/* ---------- boot ---------- */
(async function init() {
  $('#brand').innerHTML = ICON.gem + '<span>SAPPHIRE</span><small>Admin</small>';
  $$('[data-ic]').forEach(el => el.innerHTML = IC[el.dataset.ic]);
  applyI18n();
  startClock($('#clock'));
  await loadSettings();
  const h = location.hash.replace('#', '');
  go(['dashboard', 'products', 'sales', 'users', 'settings'].includes(h) ? h : 'dashboard');
  if (ME.must_change) passwordModal(true);
})();
$('#btn-lang').onclick = toggleLang;
$('#btn-pw').onclick = (e) => { e.preventDefault(); passwordModal(false); };
document.addEventListener('langchange', () => go(TAB));
$$('#side [data-tab]').forEach(b => b.onclick = () => go(b.dataset.tab));
window.addEventListener('hashchange', () => {
  const h = location.hash.replace('#', '');
  if (h !== TAB && ['dashboard', 'products', 'sales', 'users', 'settings'].includes(h)) go(h);
});

function go(tab) {
  TAB = tab;
  history.replaceState(null, '', '#' + tab);
  $$('#side [data-tab]').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  killCharts();
  ({ dashboard: viewDashboard, products: viewProducts, sales: viewSales, users: viewUsers, settings: viewSettings })[tab]();
}

function monthLabel(ym) {
  const [y, m] = ym.split('-').map(Number);
  return tl('month_names').split(',')[m - 1] + ' ' + y;
}
function shiftMonth(ym, d) {
  const [y, m] = ym.split('-').map(Number);
  const dt = new Date(y, m - 1 + d, 1);
  return dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0');
}
function localToday() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Nassau' }); // YYYY-MM-DD
}

/* =========================================================== DASHBOARD */
let dashMonth = localToday().slice(0, 7);
async function viewDashboard() {
  const main = $('#main');
  main.innerHTML = `
    <div class="page-h"><h2>${esc(t('dashboard'))}</h2>
      <div class="month-nav"><button class="btn btn-sm" id="m-prev">‹</button><span class="lbl">${esc(monthLabel(dashMonth))}</span>
      <button class="btn btn-sm" id="m-next" ${dashMonth >= localToday().slice(0, 7) ? 'disabled' : ''}>›</button></div></div>
    <div class="empty">…</div>`;
  $('#m-prev').onclick = () => { dashMonth = shiftMonth(dashMonth, -1); go('dashboard'); };
  $('#m-next').onclick = () => { dashMonth = shiftMonth(dashMonth, 1); go('dashboard'); };
  let d;
  try { d = await api('/api/stats/month?month=' + dashMonth); } catch (e) { main.querySelector('.empty').textContent = e.message; return; }
  if (TAB !== 'dashboard') return;
  const S = d.summary, C = d.change, I = d.inventory;
  const delta = (v) => v == null ? `<div class="d muted">—</div>` : `<div class="d ${v >= 0 ? 'up' : 'down'}">${v >= 0 ? '▲' : '▼'} ${Math.abs(v)}% ${esc(tl('vs_last_month'))}</div>`;
  main.querySelector('.empty').remove();
  main.insertAdjacentHTML('beforeend', `
    <div class="kpis">
      <div class="card kpi"><div class="k">${esc(tl('month_revenue'))}</div><div class="v">${fmt(S.revenue)}</div>${delta(C.revenue)}</div>
      <div class="card kpi"><div class="k">${esc(tl('sales_count'))}</div><div class="v">${S.count}</div>${delta(C.count)}</div>
      <div class="card kpi"><div class="k">${esc(tl('avg_ticket'))}</div><div class="v">${fmt(S.avg_ticket)}</div><div class="d muted">${S.items} ${esc(tl('items_sold').toLowerCase())}</div></div>
      <div class="card kpi" title="${esc(tl('profit_note'))}"><div class="k">${esc(tl('est_profit'))}</div><div class="v">${fmt(S.profit)}</div>${delta(C.profit)}</div>
      <div class="card kpi"><div class="k">${esc(tl('vat_collected'))}</div><div class="v">${fmt(S.vat)}</div><div class="d muted">${esc(t('discount'))}: ${fmt(S.discounts)}</div></div>
    </div>
    <div class="dash-grid">
      <div class="card"><div class="card-h"><h3>${esc(tl('revenue_by_day'))}</h3></div><div class="card-b"><div class="chart-box"><canvas id="c-day"></canvas></div></div></div>
      <div class="card"><div class="card-h"><h3>${esc(tl('by_category'))}</h3></div><div class="card-b"><div class="chart-box"><canvas id="c-cat"></canvas></div></div></div>
    </div>
    <div class="dash-grid">
      <div class="card"><div class="card-h"><h3>${esc(tl('top_products'))}</h3></div>
        ${d.top_products.length ? `<table class="t"><thead><tr><th>#</th><th>${esc(tl('name'))}</th><th class="right">${esc(t('qty'))}</th><th class="right">${esc(t('total'))}</th></tr></thead><tbody>
        ${d.top_products.map((p, i) => `<tr><td class="muted">${i + 1}</td><td><b>${esc(p.name)}</b></td><td class="right">${p.qty}</td><td class="right">${fmt(p.revenue)}</td></tr>`).join('')}</tbody></table>`
        : `<div class="empty">${esc(tl('no_data'))}</div>`}</div>
      <div class="card"><div class="card-h"><h3>${esc(tl('busiest_hours'))}</h3></div><div class="card-b"><div class="chart-box sm"><canvas id="c-hour"></canvas></div></div></div>
    </div>
    <div class="dash-grid3">
      <div class="card"><div class="card-h"><h3>⚠️ ${esc(tl('low_stock'))}</h3><span class="badge b-warn">${I.low_stock_count}</span></div>
        ${d.low_stock.length ? `<table class="t"><tbody>${d.low_stock.map(p => `<tr><td>${esc(p.name)}${p.size ? ` <span class="muted small">${esc(p.size)}</span>` : ''}</td>
          <td class="right"><span class="badge ${p.stock <= 0 ? 'b-bad' : 'b-warn'}">${p.stock}</span></td></tr>`).join('')}</tbody></table>` : `<div class="empty">✓</div>`}</div>
      <div class="card"><div class="card-h"><h3>${esc(tl('slow_movers'))}</h3></div>
        <div class="card-b muted small" style="padding-bottom:0">${esc(tl('slow_hint'))}</div>
        ${d.slow_movers.length ? `<table class="t"><tbody>${d.slow_movers.map(p => `<tr><td>${esc(p.name)}</td><td class="right muted">${p.stock} ${esc(tl('units'))}</td></tr>`).join('')}</tbody></table>` : `<div class="empty">✓</div>`}</div>
      <div class="card"><div class="card-h"><h3>${esc(tl('inventory'))}</h3></div><div class="card-b" style="display:grid;gap:10px">
        <div class="row"><span class="grow muted">${esc(tl('products_count'))}</span><b>${I.products}</b></div>
        <div class="row"><span class="grow muted">${esc(tl('units_in_stock'))}</span><b>${I.units}</b></div>
        <div class="row"><span class="grow muted">${esc(tl('at_cost'))}</span><b>${fmt(I.value_cost)}</b></div>
        <div class="row"><span class="grow muted">${esc(tl('at_retail'))}</span><b>${fmt(I.value_retail)}</b></div>
        <div class="row"><span class="grow muted">${esc(tl('out_of_stock_n'))}</span><b class="${I.out_of_stock ? 'down' : ''}">${I.out_of_stock}</b></div>
        <hr style="border:0;border-top:1px solid var(--line);width:100%">
        <div class="k muted small b">${esc(tl('payment_methods'))}</div>
        ${Object.keys(d.by_method).length ? Object.entries(d.by_method).map(([k, v]) => `<div class="row"><span class="grow">${esc(t(k))}</span><b>${fmt(v)}</b></div>`).join('') : `<span class="muted">—</span>`}
        <div class="k muted small b" style="margin-top:6px">${esc(tl('by_cashier'))}</div>
        ${d.by_cashier.length ? d.by_cashier.map(c => `<div class="row"><span class="grow">${esc(c.name)} <span class="muted small">(${c.count})</span></span><b>${fmt(c.revenue)}</b></div>`).join('') : `<span class="muted">—</span>`}
      </div></div>
    </div>`);

  Chart.defaults.font.family = getComputedStyle(document.body).fontFamily;
  Chart.defaults.color = '#5d6880';
  const money0 = (v) => (SETTINGS.currency || '$') + Number(v).toLocaleString('en-US', { maximumFractionDigits: 0 });
  charts.push(new Chart($('#c-day'), {
    type: 'bar',
    data: { labels: d.by_day.map(x => Number(x.date.slice(8))), datasets: [{ data: d.by_day.map(x => x.revenue), backgroundColor: '#2f5fc4', borderRadius: 4, maxBarThickness: 22 }] },
    options: { maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => fmt(c.raw) + ` · ${d.by_day[c.dataIndex].count} ${t('sales').toLowerCase()}` } } },
      scales: { y: { ticks: { callback: money0 }, grid: { color: '#eef1f6' } }, x: { grid: { display: false } } } },
  }));
  const palette = ['#1b3f86', '#c8a24a', '#2f5fc4', '#7a93c9', '#e3c983', '#0f2a5f', '#a8b7d8', '#8c6f2c', '#5d6880'];
  if (d.by_category.length) {
    charts.push(new Chart($('#c-cat'), {
      type: 'doughnut',
      data: { labels: d.by_category.map(c => c.category), datasets: [{ data: d.by_category.map(c => c.revenue), backgroundColor: palette, borderWidth: 2, borderColor: '#fff' }] },
      options: { maintainAspectRatio: false, cutout: '62%', plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 10 } }, tooltip: { callbacks: { label: c => `${c.label}: ${fmt(c.raw)} (${d.by_category[c.dataIndex].qty})` } } } },
    }));
  } else $('#c-cat').parentElement.innerHTML = `<div class="empty">${esc(tl('no_data'))}</div>`;
  const active = d.by_hour.filter(h => h.count).map(h => h.hour);
  const hFrom = Math.min(8, ...active), hTo = Math.max(20, ...active);
  const hours = d.by_hour.filter(h => h.hour >= hFrom && h.hour <= hTo);
  charts.push(new Chart($('#c-hour'), {
    type: 'bar',
    data: { labels: hours.map(h => (h.hour % 12 || 12) + (h.hour < 12 ? 'am' : 'pm')), datasets: [{ data: hours.map(h => h.count), backgroundColor: '#c8a24a', borderRadius: 4 }] },
    options: { maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => `${c.raw} ${t('sales').toLowerCase()} · ${fmt(hours[c.dataIndex].revenue)}` } } },
      scales: { y: { ticks: { precision: 0 }, grid: { color: '#eef1f6' } }, x: { grid: { display: false } } } },
  }));
}

/* =========================================================== PRODUCTS */
let PRODUCTS = [];
const prodFilter = { q: '', cat: '', low: false };
const selected = new Set();

async function viewProducts() {
  const main = $('#main');
  const cats = SETTINGS.categories || [];
  main.innerHTML = `
    <div class="page-h"><h2>${esc(t('products'))}</h2>
      <button class="btn" id="p-import">⬆ ${esc(tl('import_csv'))}</button>
      <a class="btn" href="/api/export/products.csv">⬇ ${esc(tl('export_csv'))}</a>
      <button class="btn" id="p-labels">🏷 ${esc(tl('print_labels'))} <span id="sel-n" class="badge b-blue hidden"></span></button>
      <button class="btn btn-primary" id="p-new">+ ${esc(tl('new_product'))}</button></div>
    <div class="card">
      <div class="card-h wrap">
        <input class="input" id="p-q" placeholder="${esc(tl('search_products'))}" style="max-width:320px" value="${esc(prodFilter.q)}">
        <select class="input" id="p-cat" style="max-width:200px"><option value="">${esc(tl('all_categories'))}</option>
          ${cats.map(c => `<option ${prodFilter.cat === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select>
        <label class="check"><input type="checkbox" id="p-low" ${prodFilter.low ? 'checked' : ''}> ${esc(tl('low_only'))}</label>
        <span class="grow"></span><span class="muted small" id="p-count"></span>
      </div>
      <div class="table-wrap" id="p-table"><div class="empty">…</div></div>
    </div>`;
  $('#p-new').onclick = () => productModal();
  $('#p-import').onclick = importModal;
  $('#p-labels').onclick = () => labelsModal();
  let tmr;
  $('#p-q').oninput = (e) => { prodFilter.q = e.target.value; clearTimeout(tmr); tmr = setTimeout(drawProducts, 120); };
  $('#p-cat').onchange = (e) => { prodFilter.cat = e.target.value; drawProducts(); };
  $('#p-low').onchange = (e) => { prodFilter.low = e.target.checked; drawProducts(); };
  await reloadProducts();
}
async function reloadProducts() {
  try { PRODUCTS = await api('/api/products'); } catch (e) { $('#p-table').innerHTML = `<div class="empty">${esc(e.message)}</div>`; return; }
  drawProducts();
}
function filteredProducts() {
  const q = prodFilter.q.trim().toLowerCase();
  return PRODUCTS.filter(p => p.active &&
    (!q || p.name.toLowerCase().includes(q) || p.barcode.toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q) || (p.color || '').toLowerCase().includes(q)) &&
    (!prodFilter.cat || p.category === prodFilter.cat) &&
    (!prodFilter.low || p.stock <= p.min_stock));
}
function drawProducts() {
  const list = filteredProducts();
  $('#p-count').textContent = `${list.length} / ${PRODUCTS.filter(p => p.active).length}`;
  const n = selected.size;
  $('#sel-n').textContent = n; $('#sel-n').classList.toggle('hidden', !n);
  if (!list.length) { $('#p-table').innerHTML = `<div class="empty">${esc(tl('no_data'))}</div>`; return; }
  $('#p-table').innerHTML = `<table class="t"><thead><tr>
      <th style="width:34px"><input type="checkbox" id="sel-all" title="${esc(tl('select_all'))}"></th>
      <th>${esc(tl('name'))}</th><th>${esc(tl('barcode'))}</th><th>${esc(tl('category'))}</th>
      <th class="right">${esc(t('price'))}</th><th class="right">${esc(tl('cost'))}</th><th class="right">${esc(tl('stock'))}</th>
      <th class="right">${esc(tl('sold_30d'))}</th><th></th></tr></thead><tbody>
    ${list.map(p => `<tr data-id="${p.id}">
      <td><input type="checkbox" data-sel="${p.id}" ${selected.has(p.id) ? 'checked' : ''}></td>
      <td><b>${esc(p.name)}</b>${p.size || p.color ? `<div class="muted small">${esc([p.size, p.color].filter(Boolean).join(' · '))}</div>` : ''}</td>
      <td class="mono small">${esc(p.barcode)}</td>
      <td><span class="badge b-gray">${esc(p.category)}</span></td>
      <td class="right nowrap"><b>${fmt(p.price)}</b></td>
      <td class="right nowrap muted">${fmt(p.cost)}</td>
      <td class="right"><span class="badge ${p.stock <= 0 ? 'b-bad' : p.stock <= p.min_stock ? 'b-warn' : 'b-ok'}">${p.stock}</span></td>
      <td class="right muted">${p.sold_30d || 0}</td>
      <td class="nowrap right">
        <button class="btn btn-sm" data-act="stock">± ${esc(tl('add_stock'))}</button>
        <button class="btn btn-sm" data-act="edit">${esc(tl('edit'))}</button>
        <button class="btn btn-sm" data-act="hist" title="${esc(tl('history'))}">🕘</button>
        <button class="btn btn-sm btn-danger btn-icon" data-act="del" title="${esc(tl('delete'))}">${ICON.trash}</button>
      </td></tr>`).join('')}</tbody></table>`;
  $('#sel-all').checked = list.length && list.every(p => selected.has(p.id));
  $('#sel-all').onchange = (e) => { list.forEach(p => e.target.checked ? selected.add(p.id) : selected.delete(p.id)); drawProducts(); };
  $$('[data-sel]').forEach(cb => cb.onchange = () => { cb.checked ? selected.add(+cb.dataset.sel) : selected.delete(+cb.dataset.sel); $('#sel-n').textContent = selected.size; $('#sel-n').classList.toggle('hidden', !selected.size); });
  $$('#p-table [data-act]').forEach(b => b.onclick = () => {
    const p = PRODUCTS.find(x => x.id === +b.closest('tr').dataset.id);
    ({ stock: stockModal, edit: productModal, hist: historyModal, del: deleteProduct })[b.dataset.act](p);
  });
}

function productModal(p) {
  const isNew = !p;
  p = p || { barcode: '', name: '', category: (SETTINGS.categories || [])[0] || 'Other', price: '', cost: '', stock: 0, min_stock: 2, size: '', color: '', description: '' };
  const cats = [...new Set([...(SETTINGS.categories || []), p.category].filter(Boolean))];
  const body = document.createElement('form');
  body.style.cssText = 'display:flex;flex-direction:column;gap:12px';
  body.innerHTML = `
    <label class="f">${esc(tl('barcode'))}
      <div class="row"><input class="input mono" name="barcode" value="${esc(p.barcode)}" autocomplete="off">
      <button type="button" class="btn" data-gen>${esc(tl('generate'))}</button></div>
      <span class="small muted" style="font-weight:500">${esc(tl('barcode_help'))}</span></label>
    <label class="f">${esc(tl('name'))} *<input class="input" name="name" value="${esc(p.name)}" required></label>
    <div class="grid3">
      <label class="f">${esc(tl('category'))}<select class="input" name="category">${cats.map(c => `<option ${c === p.category ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select></label>
      <label class="f">${esc(tl('size'))}<input class="input" name="size" value="${esc(p.size)}"></label>
      <label class="f">${esc(tl('color'))}<input class="input" name="color" value="${esc(p.color)}"></label>
    </div>
    <div class="grid3">
      <label class="f">${esc(t('price'))} *<input class="input" name="price" inputmode="decimal" value="${p.price}" required></label>
      <label class="f">${esc(tl('cost'))}<input class="input" name="cost" inputmode="decimal" value="${p.cost}"></label>
      <label class="f">${esc(tl('stock'))}<input class="input" name="stock" type="number" step="1" value="${p.stock}"></label>
    </div>
    <div class="grid2">
      <label class="f">${esc(tl('min_stock'))}<input class="input" name="min_stock" type="number" min="0" step="1" value="${p.min_stock}"></label>
      <label class="f">${esc(tl('description'))}<input class="input" name="description" value="${esc(p.description)}"></label>
    </div>
    <div class="login-err" data-err></div>`;
  const foot = document.createElement('div');
  foot.innerHTML = `<button class="btn" data-close>${esc(t('cancel'))}</button>${isNew ? `<button class="btn" data-save-new>${esc(t('save'))} + ${esc(tl('new_product'))}</button>` : ''}<button class="btn btn-primary" data-save>${esc(t('save'))}</button>`;
  const m = openModal({ title: isNew ? tl('new_product') : tl('edit') + ': ' + p.name, body, footer: foot, wide: true });
  $('[data-close]', foot).onclick = () => m.close();
  const bc = $('[name=barcode]', body);
  setTimeout(() => (isNew ? bc : $('[name=name]', body)).focus(), 40);
  // scanner ends with Enter: jump to name instead of submitting
  bc.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); $('[name=name]', body).focus(); } });
  $('[data-gen]', body).onclick = async () => { try { bc.value = (await api('/api/products/next-code')).code; } catch (e) { toast(e.message, 'bad'); } };
  const save = async (again) => {
    const fd = Object.fromEntries(new FormData(body));
    const payload = { ...fd, price: parseFloat(fd.price), cost: parseFloat(fd.cost || 0) || 0, stock: parseInt(fd.stock || 0, 10) || 0, min_stock: parseInt(fd.min_stock || 0, 10) || 0 };
    if (!payload.name || isNaN(payload.price)) { $('[data-err]', body).textContent = tl('name') + ' / ' + t('price') + ' ?'; return; }
    try {
      if (isNew) await api('/api/products', { method: 'POST', body: payload });
      else await api('/api/products/' + p.id, { method: 'PUT', body: payload });
      toast(tl('product_saved'), 'ok');
      m.close();
      await reloadProducts();
      if (again) productModal();
    } catch (e) { $('[data-err]', body).textContent = e.code === 'barcode_exists' ? tl('barcode') + ' ✗ (already used)' : e.message; }
  };
  body.addEventListener('submit', e => { e.preventDefault(); save(false); });
  $('[data-save]', foot).onclick = () => save(false);
  if (isNew) $('[data-save-new]', foot).onclick = () => save(true);
}

function stockModal(p) {
  const reasons = ['received', 'count_fix', 'damaged', 'returned'];
  const body = `
    <div class="row"><b class="grow">${esc(p.name)}</b><span class="badge b-blue">${esc(tl('stock'))}: ${p.stock}</span></div>
    <label class="f">${esc(tl('quantity'))}<input class="input" name="delta" type="number" step="1" placeholder="+5" style="font-size:22px;font-weight:800"></label>
    <label class="f">${esc(tl('reason'))}<select class="input" name="reason">${reasons.map(r => `<option value="${esc(tl(r))}">${esc(tl(r))}</option>`).join('')}</select></label>
    <div class="login-err" data-err></div>`;
  const foot = document.createElement('div');
  foot.innerHTML = `<button class="btn" data-close>${esc(t('cancel'))}</button><button class="btn btn-primary" data-save>${esc(t('save'))}</button>`;
  const m = openModal({ title: tl('receive_stock'), body, footer: foot });
  $('[data-close]', foot).onclick = () => m.close();
  const save = async () => {
    const delta = parseInt($('[name=delta]', m).value, 10);
    if (!delta) { $('[data-err]', m).textContent = tl('quantity'); return; }
    try {
      await api(`/api/products/${p.id}/stock`, { method: 'POST', body: { delta, reason: $('[name=reason]', m).value } });
      toast(tl('stock_updated'), 'ok'); m.close(); reloadProducts();
    } catch (e) { $('[data-err]', m).textContent = e.message; }
  };
  $('[data-save]', foot).onclick = save;
  $('[name=delta]', m).addEventListener('keydown', e => { if (e.key === 'Enter') save(); });
}

async function historyModal(p) {
  let rows = [];
  try { rows = await api(`/api/products/${p.id}/history`); } catch (e) { toast(e.message, 'bad'); return; }
  openModal({ title: tl('stock_history') + ': ' + p.name, wide: true, body: rows.length ? `<table class="t"><thead><tr><th>${esc(t('date'))}</th><th>${esc(tl('reason'))}</th><th class="right">${esc(tl('change_col'))}</th><th class="right">${esc(tl('final_col'))}</th><th>${esc(tl('user_col'))}</th></tr></thead><tbody>
    ${rows.map(r => `<tr><td class="nowrap">${esc(fmtDateTime(r.date))}</td><td>${esc(r.reason)}</td><td class="right ${r.change > 0 ? 'up' : 'down'}"><b>${r.change > 0 ? '+' : ''}${r.change}</b></td><td class="right">${r.final ?? ''}</td><td class="muted">${esc(r.user || '')}</td></tr>`).join('')}</tbody></table>`
    : `<div class="empty">${esc(tl('no_data'))}</div><div class="muted small">Sales are not listed here; see the Sales tab.</div>` });
}

async function deleteProduct(p) {
  if (!await confirmBox(tl('confirm_delete') + ' ' + p.name, { okText: tl('delete'), danger: true })) return;
  try {
    const r = await api('/api/products/' + p.id, { method: 'DELETE' });
    toast(r.archived ? tl('product_archived') : tl('product_deleted'), 'ok');
    selected.delete(p.id);
    reloadProducts();
  } catch (e) { toast(e.message, 'bad'); }
}

function importModal() {
  const body = `<div class="guide">${esc(tl('import_help'))}</div>
    <input type="file" accept=".csv,text/csv" class="input" name="file">
    <div data-res class="muted"></div>`;
  const foot = document.createElement('div');
  foot.innerHTML = `<button class="btn" data-close>${esc(t('close'))}</button><button class="btn btn-primary" data-go>⬆ ${esc(tl('import_csv'))}</button>`;
  const m = openModal({ title: tl('import_title'), body, footer: foot });
  $('[data-close]', foot).onclick = () => m.close();
  $('[data-go]', foot).onclick = async () => {
    const file = $('[name=file]', m).files[0];
    if (!file) return;
    const fd = new FormData(); fd.append('file', file);
    try {
      const r = await api('/api/products/import', { method: 'POST', body: fd });
      $('[data-res]', m).innerHTML = `<b class="up">${esc(tl('imported').replace('{c}', r.created).replace('{u}', r.updated))}</b>` +
        (r.errors.length ? `<div class="down small">${r.errors.map(e => `Line ${e.line}: ${esc(e.error)}`).join('<br>')}</div>` : '');
      reloadProducts();
    } catch (e) { $('[data-res]', m).innerHTML = `<span class="down">${esc(e.message)}</span>`; }
  };
}

function labelsModal() {
  const items = PRODUCTS.filter(p => selected.has(p.id));
  if (!items.length) { toast(tl('select_products_first'), 'bad'); return; }
  const body = document.createElement('div');
  body.style.cssText = 'display:flex;flex-direction:column;gap:12px';
  body.innerHTML = `
    <label class="f">${esc(tl('label_size'))}<select class="input" name="size">
      ${['50x25', '40x30', 'a4'].map(s => `<option value="${s}" ${SETTINGS.label_size === s ? 'selected' : ''}>${esc(tl('label_' + s))}</option>`).join('')}</select></label>
    <table class="t"><thead><tr><th>${esc(tl('name'))}</th><th class="right">${esc(tl('stock'))}</th><th style="width:110px">${esc(tl('copies'))}</th></tr></thead><tbody>
      ${items.map(p => `<tr><td><b>${esc(p.name)}</b> <span class="muted small mono">${esc(p.barcode)}</span></td><td class="right muted">${p.stock}</td>
        <td><input class="input" type="number" min="0" step="1" data-copies="${p.id}" value="${Math.max(1, p.stock)}"></td></tr>`).join('')}</tbody></table>`;
  const foot = document.createElement('div');
  foot.innerHTML = `<button class="btn" data-close>${esc(t('cancel'))}</button><button class="btn btn-primary" data-print>🖨 ${esc(tl('print_labels'))}</button>`;
  const m = openModal({ title: tl('labels_title'), body, footer: foot, wide: true });
  $('[data-close]', foot).onclick = () => m.close();
  $('[data-print]', foot).onclick = () => {
    const size = $('[name=size]', body).value;
    const list = [];
    items.forEach(p => { const n = parseInt($(`[data-copies="${p.id}"]`, body).value, 10) || 0; for (let i = 0; i < n; i++) list.push(p); });
    if (list.length) printLabels(list, size);
    api('/api/settings', { method: 'PUT', body: { label_size: size } }).then(s => SETTINGS = Object.assign(SETTINGS, s)).catch(() => {});
  };
}

function printLabels(list, size) {
  const store = esc(SETTINGS.store_name || 'SAPPHIRE');
  const one = (p, bcOpts) => `<div class="lbl">
      <div class="st">${store}</div>
      <div class="nm">${esc(p.name)}</div>
      ${p.size || p.color ? `<div class="vr">${esc([p.size, p.color].filter(Boolean).join(' · '))}</div>` : ''}
      <div class="bc">${barcodeSVG(p.barcode, bcOpts)}</div>
      <div class="pr">${fmt(p.price)}</div></div>`;
  let css, html;
  if (size === 'a4') {
    css = `@page { size: A4; margin: 15mm 7mm; } body { margin: 0; font-family: Arial, sans-serif; }
      .sheet { display: grid; grid-template-columns: repeat(3, 63.5mm); grid-auto-rows: 38.1mm; column-gap: 2.5mm; }
      .lbl { overflow: hidden; padding: 2mm 3mm; text-align: center; display: flex; flex-direction: column; justify-content: center; break-inside: avoid; }
      .st { font-size: 7pt; letter-spacing: 1.5px; font-weight: 700; } .nm { font-size: 9pt; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .vr { font-size: 7.5pt; } .bc svg { height: 13mm; width: auto; max-width: 100%; } .pr { font-size: 13pt; font-weight: 900; }`;
    html = `<div class="sheet">${list.map(p => one(p, { height: 34, width: 1.4, fontSize: 10 })).join('')}</div>`;
  } else {
    const [w, h] = size === '40x30' ? [40, 30] : [50, 25];
    css = `@page { size: ${w}mm ${h}mm; margin: 0; } html, body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
      .lbl { width: ${w}mm; height: ${h}mm; padding: 1mm 1.5mm; overflow: hidden; text-align: center; display: flex; flex-direction: column; justify-content: center; page-break-after: always; break-after: page; }
      .lbl:last-child { page-break-after: auto; break-after: auto; }
      .st { display: none; } .nm { font-size: 7.5pt; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.1; }
      .vr { font-size: 6.5pt; line-height: 1.1; } .bc svg { height: ${h === 30 ? 13 : 10}mm; width: auto; max-width: 100%; display: block; margin: 0 auto; }
      .pr { font-size: ${h === 30 ? 12 : 10}pt; font-weight: 900; line-height: 1.1; }`;
    html = list.map(p => one(p, { height: 30, width: 1.3, fontSize: 9, textMargin: 0 })).join('');
  }
  printHTML(html, css);
}

/* =========================================================== SALES */
const salesRange = { from: localToday(), to: localToday() };
async function viewSales() {
  const main = $('#main');
  main.innerHTML = `
    <div class="page-h"><h2>${esc(t('sales'))}</h2>
      <a class="btn" id="s-export">⬇ ${esc(tl('export_csv'))}</a></div>
    <div class="card"><div class="card-h wrap">
      <button class="btn btn-sm" data-r="today">${esc(tl('today'))}</button>
      <button class="btn btn-sm" data-r="yesterday">${esc(tl('yesterday'))}</button>
      <button class="btn btn-sm" data-r="week">${esc(tl('this_week'))}</button>
      <button class="btn btn-sm" data-r="month">${esc(tl('this_month'))}</button>
      <span class="grow"></span>
      <label class="row small muted b">${esc(tl('from'))} <input class="input" type="date" id="s-from" value="${salesRange.from}" style="width:auto"></label>
      <label class="row small muted b">${esc(tl('to'))} <input class="input" type="date" id="s-to" value="${salesRange.to}" style="width:auto"></label>
    </div><div class="card-b kpis" id="s-sum" style="padding-bottom:0"></div>
    <div class="table-wrap" id="s-table"><div class="empty">…</div></div></div>`;
  const setR = (r) => {
    const today = localToday();
    const d = new Date(today + 'T12:00:00');
    const iso = (x) => x.toISOString().slice(0, 10);
    if (r === 'today') { salesRange.from = salesRange.to = today; }
    if (r === 'yesterday') { d.setDate(d.getDate() - 1); salesRange.from = salesRange.to = iso(d); }
    if (r === 'week') { const wd = (d.getDay() + 6) % 7; d.setDate(d.getDate() - wd); salesRange.from = iso(d); salesRange.to = today; }
    if (r === 'month') { salesRange.from = today.slice(0, 8) + '01'; salesRange.to = today; }
    $('#s-from').value = salesRange.from; $('#s-to').value = salesRange.to;
    loadSales();
  };
  $$('[data-r]').forEach(b => b.onclick = () => setR(b.dataset.r));
  $('#s-from').onchange = (e) => { salesRange.from = e.target.value; if (salesRange.to < salesRange.from) { salesRange.to = salesRange.from; $('#s-to').value = salesRange.to; } loadSales(); };
  $('#s-to').onchange = (e) => { salesRange.to = e.target.value; loadSales(); };
  loadSales();
}
async function loadSales() {
  $('#s-export').href = `/api/export/sales.csv?from=${salesRange.from}&to=${salesRange.to}`;
  let d;
  try { d = await api(`/api/sales?from=${salesRange.from}&to=${salesRange.to}`); } catch (e) { $('#s-table').innerHTML = `<div class="empty">${esc(e.message)}</div>`; return; }
  const s = d.summary;
  $('#s-sum').innerHTML = `
    <div class="kpi mini"><div class="k">${esc(t('total'))}</div><div class="v">${fmt(s.total)}</div></div>
    <div class="kpi mini"><div class="k">${esc(t('sales'))}</div><div class="v">${s.count}</div></div>
    <div class="kpi mini"><div class="k">${esc(t('cash'))}</div><div class="v">${fmt(s.cash)}</div></div>
    <div class="kpi mini"><div class="k">${esc(t('card'))}</div><div class="v">${fmt(s.card)}</div></div>
    <div class="kpi mini"><div class="k">${esc(t('other'))}</div><div class="v">${fmt(s.other)}</div></div>`;
  if (!d.sales.length) { $('#s-table').innerHTML = `<div class="empty">${esc(tl('no_data'))}</div>`; return; }
  $('#s-table').innerHTML = `<table class="t"><thead><tr><th>${esc(t('receipt'))}</th><th>${esc(t('date'))}</th><th>${esc(t('cashier'))}</th>
      <th class="right">${esc(t('items'))}</th><th>${esc(t('method'))}</th><th class="right">${esc(t('total'))}</th><th>${esc(tl('status'))}</th></tr></thead><tbody>
    ${d.sales.map(x => `<tr class="clickable" data-id="${x.id}">
      <td class="mono b">${esc(x.number)}</td><td class="nowrap">${esc(fmtDateTime(x.date))}</td><td>${esc(x.cashier)}</td>
      <td class="right">${x.items_count}</td><td>${esc(t(x.method))}</td>
      <td class="right nowrap"><b style="${x.voided ? 'text-decoration:line-through;opacity:.6' : ''}">${fmt(x.total)}</b></td>
      <td>${x.voided ? `<span class="badge b-bad">${esc(t('voided'))}</span>` : '<span class="badge b-ok">OK</span>'}</td></tr>`).join('')}</tbody></table>`;
  $$('#s-table tr[data-id]').forEach(tr => tr.onclick = () => saleModal(+tr.dataset.id));
}
async function saleModal(id) {
  let s;
  try { s = await api('/api/sales/' + id); } catch (e) { toast(e.message, 'bad'); return; }
  const body = `
    <div class="row wrap"><span class="mono b">${esc(s.number)}</span><span class="muted">${esc(fmtDateTime(s.date))} · ${esc(s.cashier)}</span>
      ${s.voided ? `<span class="badge b-bad">${esc(t('voided'))}: ${esc(s.void_reason)}</span>` : ''}</div>
    <table class="t"><tbody>${s.items.map(i => `<tr><td>${esc(i.name)}<div class="muted small mono">${esc(i.barcode)}</div></td><td class="nowrap">${i.qty} × ${fmt(i.price)}</td><td class="right"><b>${fmt(i.total)}</b></td></tr>`).join('')}</tbody></table>
    <div class="totals" style="padding:0">
      <div class="tot-row"><span>${esc(t('subtotal'))}</span><span>${fmt(s.subtotal)}</span></div>
      ${s.discount ? `<div class="tot-row disc"><span>${esc(t('discount'))}</span><span>-${fmt(s.discount)}</span></div>` : ''}
      <div class="tot-row"><span>${esc(t('vat'))}</span><span>${fmt(s.vat)}</span></div>
      <div class="tot-row"><b>${esc(t('total'))}</b><b>${fmt(s.total)}</b></div>
      <div class="tot-row muted"><span>${esc(t(s.method))}${s.cash != null ? ' ' + fmt(s.cash) : ''}</span><span>${s.change != null ? esc(t('change')) + ' ' + fmt(s.change) : ''}</span></div>
    </div>`;
  const foot = document.createElement('div');
  foot.innerHTML = `${s.voided ? '' : `<button class="btn btn-danger" data-void>${esc(tl('void_sale'))}</button>`}<span class="grow"></span>
    <button class="btn" data-close>${esc(t('close'))}</button><button class="btn btn-primary" data-print>🖨 ${esc(t('reprint'))}</button>`;
  foot.style.cssText = 'display:flex;gap:10px;width:100%';
  const m = openModal({ title: t('receipt') + ' ' + s.number, body, footer: foot, wide: true });
  $('[data-close]', foot).onclick = () => m.close();
  $('[data-print]', foot).onclick = () => printReceipt(s, { copy: true });
  const vb = $('[data-void]', foot);
  if (vb) vb.onclick = async () => {
    if (!await confirmBox(tl('confirm_void'), { okText: tl('void_sale'), danger: true })) return;
    const reason = prompt(tl('void_reason'), '') || 'Voided';
    try { await api(`/api/sales/${s.id}/void`, { method: 'POST', body: { reason } }); toast(tl('sale_voided'), 'ok'); m.close(); loadSales(); }
    catch (e) { toast(e.message, 'bad'); }
  };
}

/* =========================================================== USERS */
async function viewUsers() {
  const main = $('#main');
  main.innerHTML = `<div class="page-h"><h2>${esc(t('users'))}</h2><button class="btn btn-primary" id="u-new">+ ${esc(tl('new_user'))}</button></div>
    <div class="card" id="u-table"><div class="empty">…</div></div>`;
  $('#u-new').onclick = () => userModal();
  let users;
  try { users = await api('/api/users'); } catch (e) { $('#u-table').innerHTML = `<div class="empty">${esc(e.message)}</div>`; return; }
  $('#u-table').innerHTML = `<table class="t"><thead><tr><th>${esc(tl('name'))}</th><th>${esc(t('username'))}</th><th>${esc(tl('role'))}</th><th>${esc(tl('status'))}</th><th></th></tr></thead><tbody>
    ${users.map(u => `<tr data-id="${u.id}"><td><b>${esc(u.name)}</b>${u.id === ME.id ? ' <span class="muted small">(you)</span>' : ''}</td><td class="mono">${esc(u.username)}</td>
      <td><span class="badge ${u.role === 'admin' ? 'b-blue' : 'b-gray'}">${esc(u.role === 'admin' ? tl('admin') : tl('cashier_role'))}</span></td>
      <td>${u.active ? `<span class="badge b-ok">${esc(tl('active'))}</span>` : `<span class="badge b-bad">${esc(tl('inactive'))}</span>`}</td>
      <td class="right nowrap"><button class="btn btn-sm" data-edit>${esc(tl('edit'))}</button>
        ${u.id !== ME.id ? `<button class="btn btn-sm ${u.active ? 'btn-danger' : ''}" data-toggle>${esc(u.active ? tl('disable') : tl('enable'))}</button>` : ''}</td></tr>`).join('')}</tbody></table>`;
  $$('#u-table [data-edit]').forEach(b => b.onclick = () => userModal(users.find(u => u.id === +b.closest('tr').dataset.id)));
  $$('#u-table [data-toggle]').forEach(b => b.onclick = async () => {
    const u = users.find(x => x.id === +b.closest('tr').dataset.id);
    try { await api('/api/users/' + u.id, { method: 'PUT', body: { active: !u.active } }); viewUsers(); } catch (e) { toast(e.message, 'bad'); }
  });
}
function userModal(u) {
  const isNew = !u;
  u = u || { name: '', username: '', role: 'cashier' };
  const body = document.createElement('form');
  body.style.cssText = 'display:flex;flex-direction:column;gap:12px';
  body.innerHTML = `
    <label class="f">${esc(tl('name'))}<input class="input" name="name" value="${esc(u.name)}" required></label>
    <label class="f">${esc(t('username'))}<input class="input mono" name="username" value="${esc(u.username)}" ${isNew ? '' : 'disabled'} autocapitalize="none" required></label>
    <label class="f">${esc(tl('role'))}<select class="input" name="role" ${u.id === ME.id ? 'disabled' : ''}>
      <option value="cashier" ${u.role === 'cashier' ? 'selected' : ''}>${esc(tl('cashier_role'))}</option>
      <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>${esc(tl('admin'))}</option></select></label>
    <label class="f">${esc(isNew ? t('password') : tl('reset_password'))}<input class="input" type="text" name="password" autocomplete="new-password" ${isNew ? 'required minlength="6"' : ''}></label>
    <div class="login-err" data-err></div>`;
  const foot = document.createElement('div');
  foot.innerHTML = `<button class="btn" data-close>${esc(t('cancel'))}</button><button class="btn btn-primary" data-save>${esc(t('save'))}</button>`;
  const m = openModal({ title: isNew ? tl('new_user') : tl('edit') + ': ' + u.name, body, footer: foot });
  $('[data-close]', foot).onclick = () => m.close();
  const save = async () => {
    const fd = Object.fromEntries(new FormData(body));
    try {
      if (isNew) await api('/api/users', { method: 'POST', body: fd });
      else await api('/api/users/' + u.id, { method: 'PUT', body: { name: fd.name, role: fd.role, password: fd.password || undefined } });
      toast(tl('user_saved'), 'ok'); m.close(); viewUsers();
    } catch (e) { $('[data-err]', body).textContent = e.message; }
  };
  body.addEventListener('submit', e => { e.preventDefault(); save(); });
  $('[data-save]', foot).onclick = save;
}

/* =========================================================== SETTINGS */
async function viewSettings() {
  await loadSettings();
  const s = SETTINGS;
  const main = $('#main');
  main.innerHTML = `
    <div class="page-h"><h2>${esc(t('settings'))}</h2><button class="btn" id="st-test">🖨 ${esc(tl('test_print'))}</button><button class="btn btn-primary" id="st-save">${esc(t('save'))}</button></div>
    <div class="dash-grid">
      <form class="card" id="st-form"><div class="card-h"><h3>${esc(tl('store_info'))}</h3></div><div class="card-b" style="display:flex;flex-direction:column;gap:12px">
        <div class="grid2"><label class="f">${esc(tl('store_name'))}<input class="input" name="store_name" value="${esc(s.store_name)}"></label>
          <label class="f">${esc(tl('tagline'))}<input class="input" name="store_tagline" value="${esc(s.store_tagline)}"></label></div>
        <div class="grid2"><label class="f">${esc(tl('address'))}<input class="input" name="store_address" value="${esc(s.store_address)}"></label>
          <label class="f">${esc(tl('phone'))}<input class="input" name="store_phone" value="${esc(s.store_phone)}"></label></div>
        <label class="f">${esc(tl('receipt_footer'))}<input class="input" name="receipt_footer" value="${esc(s.receipt_footer)}"></label>
        <label class="f">${esc(tl('return_policy'))}<input class="input" name="return_policy" value="${esc(s.return_policy)}"></label>
        <h3 style="margin:8px 0 0;font-size:15px">${esc(tl('taxes'))}</h3>
        <label class="check"><input type="checkbox" name="vat_enabled" ${s.vat_enabled ? 'checked' : ''}> ${esc(tl('vat_enabled'))}</label>
        <div class="grid2"><label class="f">${esc(tl('vat_rate'))}<input class="input" name="vat_rate" inputmode="decimal" value="${s.vat_rate}"></label>
          <label class="check" style="align-self:end;padding-bottom:10px"><input type="checkbox" name="prices_include_vat" ${s.prices_include_vat ? 'checked' : ''}> ${esc(tl('prices_include_vat'))}</label></div>
        <h3 style="margin:8px 0 0;font-size:15px">${esc(tl('printing'))}</h3>
        <label class="f">${esc(tl('paper_width'))}<select class="input" name="paper_width">
          <option value="80" ${String(s.paper_width) === '80' ? 'selected' : ''}>${esc(tl('mm80'))}</option>
          <option value="58" ${String(s.paper_width) === '58' ? 'selected' : ''}>${esc(tl('mm58'))}</option></select></label>
        <label class="check"><input type="checkbox" name="auto_print" ${s.auto_print ? 'checked' : ''}> ${esc(tl('auto_print'))}</label>
        <h3 style="margin:8px 0 0;font-size:15px">${esc(tl('inventory_rules'))}</h3>
        <label class="f">${esc(tl('categories'))} <span class="muted small" style="font-weight:500">${esc(tl('categories_help'))}</span>
          <textarea class="input" name="categories" rows="2">${esc((s.categories || []).join(', '))}</textarea></label>
        <label class="check"><input type="checkbox" name="allow_negative_stock" ${s.allow_negative_stock ? 'checked' : ''}> ${esc(tl('allow_negative'))}</label>
      </div></form>
      <div class="guide" style="align-self:start"><h4>🖨 ${esc(tl('print_guide_title'))}</h4>
        <ol>${tl('print_guide').map(x => `<li style="margin-bottom:6px">${x}</li>`).join('')}</ol></div>
    </div>`;
  const collect = () => {
    const f = $('#st-form');
    const fd = Object.fromEntries(new FormData(f));
    ['vat_enabled', 'prices_include_vat', 'auto_print', 'allow_negative_stock'].forEach(k => fd[k] = !!f.elements[k].checked);
    return fd;
  };
  $('#st-save').onclick = async () => {
    try { SETTINGS = Object.assign(SETTINGS, await api('/api/settings', { method: 'PUT', body: collect() })); toast(tl('settings_saved'), 'ok'); }
    catch (e) { toast(e.message, 'bad'); }
  };
  $('#st-form').addEventListener('submit', e => { e.preventDefault(); $('#st-save').click(); });
  $('#st-test').onclick = () => {
    const prev = SETTINGS;
    const fd = collect();
    SETTINGS = Object.assign({}, SETTINGS, fd, { vat_rate: parseFloat(fd.vat_rate) || 0 });
    const sub = 45, disc = 0, rate = SETTINGS.vat_enabled ? SETTINGS.vat_rate / 100 : 0;
    const vat = SETTINGS.prices_include_vat ? round2(sub - sub / (1 + rate)) : round2(sub * rate);
    const total = SETTINGS.prices_include_vat ? sub : round2(sub + vat);
    printReceipt({ number: 'TEST-0001', date: new Date().toISOString(), cashier: ME.nombre, method: 'cash', subtotal: sub, discount: disc, vat, total,
      cash: 100, change: round2(100 - total), items_count: 2,
      items: [{ name: 'Sample earrings', qty: 1, price: 25, total: 25 }, { name: 'Sample sunglasses', qty: 1, price: 20, total: 20 }] });
    SETTINGS = prev;
  };
}
