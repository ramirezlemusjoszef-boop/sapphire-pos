/* SAPPHIRE POS — shared helpers: API, i18n, toasts, modals, money, sounds, printing */
'use strict';

/* ---------------- i18n ---------------- */
const I18N = {
  en: {
    login_sub: 'Point of sale', username: 'Username', password: 'Password', sign_in: 'Sign in',
    bad_credentials: 'Wrong username or password', logout: 'Log out', lang: 'ES',
    scan_placeholder: 'Scan barcode or type code + Enter', search_name: 'Search by name',
    scan_to_start: 'Scan a product to start', scan_hint: 'Use the scanner gun. The cursor is always ready.',
    item: 'Item', qty: 'Qty', price: 'Price', total: 'Total', subtotal: 'Subtotal', discount: 'Discount',
    vat: 'VAT', vat_incl: 'VAT incl.', items: 'items', cash: 'Cash', card: 'Card', transfer: 'Transfer',
    other: 'Other', cash_received: 'Cash received', exact: 'Exact', change: 'Change', short: 'Missing',
    charge: 'Charge', clear_sale: 'Clear sale', add_discount: 'Discount', today_sales: "Today's sales",
    sale_complete: 'Sale complete', print_receipt: 'Print receipt', new_sale: 'New sale',
    not_found: 'Product not found', out_of_stock: 'Out of stock', only_left: 'Only {n} left in stock',
    added: 'Added', removed: 'Removed', confirm_clear: 'Clear the current sale?', receipt: 'Receipt',
    cashier: 'Cashier', time: 'Time', method: 'Method', voided: 'Voided', reprint: 'Reprint',
    sales: 'Sales', no_sales_today: 'No sales yet today', end_of_day: 'Print day report',
    discount_title: 'Discount', amount: 'Amount ($)', percent: 'Percent (%)', apply: 'Apply', remove: 'Remove',
    cancel: 'Cancel', save: 'Save', close: 'Close', search: 'Search', admin_panel: 'Admin panel', pos: 'Cashier',
    change_password: 'Change password', current_password: 'Current password', new_password: 'New password',
    repeat_password: 'Repeat new password', must_change: 'For security, please set a new password before you start.',
    passwords_dont_match: 'Passwords do not match', password_saved: 'Password updated',
    password_too_short: 'Password must be at least 6 characters', wrong_current_password: 'Current password is wrong',
    password_too_weak: 'Choose a different password', cash_not_enough: 'Cash received is less than the total',
    insufficient_stock: 'Not enough stock for {name} (left: {stock})', empty_cart: 'The cart is empty',
    error: 'Something went wrong', saved: 'Saved', offline: 'No connection. Check the internet.',
    dashboard: 'Dashboard', products: 'Products', users: 'Users', settings: 'Settings',
    thanks: 'Thank you!', invoice: 'Receipt #', date: 'Date', printing: 'Printing…',
    shortcuts: 'F2 search · F9 charge · Esc clear',
  },
  es: {
    login_sub: 'Punto de venta', username: 'Usuario', password: 'Contraseña', sign_in: 'Entrar',
    bad_credentials: 'Usuario o contraseña incorrectos', logout: 'Salir', lang: 'EN',
    scan_placeholder: 'Escanea el código o escríbelo + Enter', search_name: 'Buscar por nombre',
    scan_to_start: 'Escanea un producto para empezar', scan_hint: 'Usa la pistola. El cursor siempre está listo.',
    item: 'Producto', qty: 'Cant.', price: 'Precio', total: 'Total', subtotal: 'Subtotal', discount: 'Descuento',
    vat: 'IVA (VAT)', vat_incl: 'IVA incl.', items: 'artículos', cash: 'Efectivo', card: 'Tarjeta', transfer: 'Transferencia',
    other: 'Otro', cash_received: 'Efectivo recibido', exact: 'Exacto', change: 'Cambio', short: 'Falta',
    charge: 'Cobrar', clear_sale: 'Borrar venta', add_discount: 'Descuento', today_sales: 'Ventas de hoy',
    sale_complete: 'Venta completada', print_receipt: 'Imprimir recibo', new_sale: 'Nueva venta',
    not_found: 'Producto no encontrado', out_of_stock: 'Sin existencias', only_left: 'Solo quedan {n} en inventario',
    added: 'Agregado', removed: 'Quitado', confirm_clear: '¿Borrar la venta actual?', receipt: 'Recibo',
    cashier: 'Cajero/a', time: 'Hora', method: 'Pago', voided: 'Anulada', reprint: 'Reimprimir',
    sales: 'Ventas', no_sales_today: 'Todavía no hay ventas hoy', end_of_day: 'Imprimir cierre del día',
    discount_title: 'Descuento', amount: 'Monto ($)', percent: 'Porcentaje (%)', apply: 'Aplicar', remove: 'Quitar',
    cancel: 'Cancelar', save: 'Guardar', close: 'Cerrar', search: 'Buscar', admin_panel: 'Administración', pos: 'Caja',
    change_password: 'Cambiar contraseña', current_password: 'Contraseña actual', new_password: 'Contraseña nueva',
    repeat_password: 'Repite la contraseña nueva', must_change: 'Por seguridad, pon una contraseña nueva antes de empezar.',
    passwords_dont_match: 'Las contraseñas no coinciden', password_saved: 'Contraseña actualizada',
    password_too_short: 'La contraseña debe tener al menos 6 caracteres', wrong_current_password: 'La contraseña actual no es correcta',
    password_too_weak: 'Elige otra contraseña', cash_not_enough: 'El efectivo recibido es menor que el total',
    insufficient_stock: 'No hay suficiente {name} (quedan: {stock})', empty_cart: 'El carrito está vacío',
    error: 'Algo salió mal', saved: 'Guardado', offline: 'Sin conexión. Revisa el internet.',
    dashboard: 'Resumen', products: 'Productos', users: 'Usuarios', settings: 'Ajustes',
    thanks: '¡Gracias!', invoice: 'Recibo #', date: 'Fecha', printing: 'Imprimiendo…',
    shortcuts: 'F2 buscar · F9 cobrar · Esc borrar',
  },
};
let LANG = (() => { try { return localStorage.getItem('lang') || 'en'; } catch (e) { return 'en'; } })();
function t(key, vars) {
  let s = (I18N[LANG] && I18N[LANG][key]) || (I18N.en[key]) || (window.EXTRA_I18N && (EXTRA_I18N[LANG]?.[key] || EXTRA_I18N.en?.[key])) || key;
  if (vars) for (const k in vars) s = s.replaceAll('{' + k + '}', vars[k]);
  return s;
}
function applyI18n(root = document) {
  root.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  root.querySelectorAll('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
  root.querySelectorAll('[data-i18n-title]').forEach(el => { el.title = t(el.dataset.i18nTitle); });
  document.documentElement.lang = LANG;
}
function toggleLang() {
  LANG = LANG === 'en' ? 'es' : 'en';
  try { localStorage.setItem('lang', LANG); } catch (e) {}
  applyI18n();
  document.dispatchEvent(new CustomEvent('langchange'));
}

/* ---------------- DOM helpers ---------------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
let SETTINGS = { currency: '$', vat_enabled: true, vat_rate: 10, prices_include_vat: false, paper_width: '80', auto_print: true };
function fmt(n) {
  const v = Number(n || 0);
  return (v < 0 ? '-' : '') + (SETTINGS.currency || '$') + Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function round2(n) { return Math.round((Number(n) + Number.EPSILON) * 100) / 100; }
function fmtDateTime(iso, opts) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString(LANG === 'es' ? 'es' : 'en-US', opts || { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Nassau' });
}
function fmtTime(iso) { return fmtDateTime(iso, { hour: 'numeric', minute: '2-digit', timeZone: 'America/Nassau' }); }

/* ---------------- API ---------------- */
async function api(path, opts = {}) {
  const o = { method: opts.method || 'GET', headers: {}, credentials: 'same-origin' };
  if (opts.body !== undefined) {
    if (opts.body instanceof FormData) o.body = opts.body;
    else { o.headers['Content-Type'] = 'application/json'; o.body = JSON.stringify(opts.body); }
  }
  let res;
  try { res = await fetch(path, o); } catch (e) { const er = new Error(t('offline')); er.code = 'offline'; throw er; }
  if (res.status === 401) { location.href = '/'; throw new Error('not_logged_in'); }
  const ct = res.headers.get('content-type') || '';
  const data = ct.includes('json') ? await res.json() : await res.text();
  if (!res.ok) {
    const er = new Error((data && data.error) ? t(data.error, data) : t('error'));
    er.code = data && data.error; er.data = data; er.status = res.status;
    throw er;
  }
  return data;
}
async function loadSettings() {
  try { SETTINGS = Object.assign(SETTINGS, await api('/api/settings')); } catch (e) {}
  return SETTINGS;
}

/* ---------------- toasts ---------------- */
function toast(msg, type = '') {
  let box = $('#toasts');
  if (!box) { box = document.createElement('div'); box.id = 'toasts'; document.body.appendChild(box); }
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  el.textContent = msg;
  box.appendChild(el);
  setTimeout(() => el.remove(), type === 'bad' ? 4500 : 2600);
}

/* ---------------- modal ---------------- */
function openModal({ title, body, footer, wide, onClose, closable = true }) {
  const bg = document.createElement('div');
  bg.className = 'modal-bg';
  bg.innerHTML = `<div class="modal ${wide ? 'wide' : ''}" role="dialog" aria-modal="true">
      <div class="modal-h"><h3>${esc(title)}</h3>${closable ? '<button class="x" data-close aria-label="close">×</button>' : ''}</div>
      <div class="modal-b"></div>${footer ? '<div class="modal-f"></div>' : ''}</div>`;
  const b = $('.modal-b', bg);
  if (typeof body === 'string') b.innerHTML = body; else if (body) b.appendChild(body);
  if (footer) { const fEl = $('.modal-f', bg); if (typeof footer === 'string') fEl.innerHTML = footer; else fEl.appendChild(footer); }
  const close = () => { bg.remove(); document.removeEventListener('keydown', onKey, true); onClose && onClose(); };
  const onKey = (e) => { if (e.key === 'Escape' && closable) { e.preventDefault(); e.stopPropagation(); close(); } };
  document.addEventListener('keydown', onKey, true);
  if (closable) {
    bg.addEventListener('mousedown', (e) => { if (e.target === bg) close(); });
    $$('[data-close]', bg).forEach(x => x.addEventListener('click', close));
  }
  document.body.appendChild(bg);
  const first = $('input:not([type=checkbox]):not([type=hidden]), select, textarea', b);
  if (first) setTimeout(() => first.focus(), 30);
  bg.close = close;
  return bg;
}
function confirmBox(msg, { okText, danger } = {}) {
  return new Promise(resolve => {
    const f = document.createElement('div');
    f.innerHTML = `<button class="btn" data-no>${esc(t('cancel'))}</button><button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" data-yes>${esc(okText || 'OK')}</button>`;
    let answered = false;
    const m = openModal({ title: msg, body: '', footer: f, onClose: () => { if (!answered) resolve(false); } });
    $('.modal-b', m).remove();
    $('[data-no]', f).onclick = () => m.close();
    $('[data-yes]', f).onclick = () => { answered = true; m.close(); resolve(true); };
    setTimeout(() => $('[data-yes]', f).focus(), 30);
  });
}

/* ---------------- sounds ---------------- */
let _ac;
function beep(ok = true) {
  try {
    _ac = _ac || new (window.AudioContext || window.webkitAudioContext)();
    const o = _ac.createOscillator(), g = _ac.createGain();
    o.type = ok ? 'sine' : 'square';
    o.frequency.value = ok ? 1250 : 220;
    g.gain.setValueAtTime(0.0001, _ac.currentTime);
    g.gain.exponentialRampToValueAtTime(ok ? 0.18 : 0.12, _ac.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, _ac.currentTime + (ok ? 0.09 : 0.3));
    o.connect(g); g.connect(_ac.destination);
    o.start(); o.stop(_ac.currentTime + (ok ? 0.1 : 0.32));
  } catch (e) {}
}

/* ---------------- icons ---------------- */
const ICON = {
  gem: `<svg class="brand-gem" viewBox="0 0 32 32" fill="none"><path d="M9 4h14l6 8-13 16L3 12l6-8z" fill="#2f5fc4"/><path d="M3 12h26M9 4l7 24M23 4l-7 24M9 4l3 8m11-8-3 8m-8 0 4-8 4 8" stroke="#c8a24a" stroke-width="1.3" stroke-linejoin="round"/></svg>`,
  scan: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 8v8M10 8v8M13 8v8M17 8v8"/></svg>`,
  cash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/></svg>`,
  card: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/></svg>`,
  transfer: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7h12l-3-3M17 17H5l3 3"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>`,
  bag: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 7h12l1 14H5L6 7z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg>`,
  trash: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>`,
};

/* ---------------- printing ---------------- */
/* Prints HTML through a hidden iframe. With Chrome started with --kiosk-printing it prints
   straight to the default printer (the thermal printer) with no dialog. */
function printHTML(html, css) {
  return new Promise(resolve => {
    const fr = document.createElement('iframe');
    fr.setAttribute('aria-hidden', 'true');
    fr.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0;pointer-events:none';
    document.body.appendChild(fr);
    const doc = fr.contentDocument;
    doc.open();
    doc.write(`<!doctype html><html><head><meta charset="utf-8"><title>${esc(SETTINGS.store_name || 'Receipt')}</title><style>${css}</style></head><body>${html}</body></html>`);
    doc.close();
    const go = () => {
      try {
        fr.contentWindow.focus();
        fr.contentWindow.print();
      } catch (e) { console.error(e); }
      setTimeout(() => { fr.remove(); resolve(); }, 1500);
    };
    // wait for barcode SVGs/layout
    setTimeout(go, 250);
  });
}

function barcodeSVG(value, opts = {}) {
  try {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    let format = 'CODE128';
    if (/^\d{13}$/.test(value) && ean13Valid(value)) format = 'EAN13';
    else if (/^\d{12}$/.test(value) && upcValid(value)) format = 'UPC';
    JsBarcode(svg, value, Object.assign({ format, displayValue: true, margin: 0, height: 40, width: 1.6, fontSize: 12, textMargin: 1 }, opts));
    return svg.outerHTML;
  } catch (e) {
    try {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      JsBarcode(svg, value, Object.assign({ format: 'CODE128', displayValue: true, margin: 0, height: 40, width: 1.6, fontSize: 12 }, opts));
      return svg.outerHTML;
    } catch (e2) { return `<div>${esc(value)}</div>`; }
  }
}
function ean13Valid(code) {
  const d = code.split('').map(Number);
  const s = d.slice(0, 12).reduce((a, n, i) => a + n * (i % 2 ? 3 : 1), 0);
  return (10 - s % 10) % 10 === d[12];
}
function upcValid(code) {
  const d = code.split('').map(Number);
  const s = d.slice(0, 11).reduce((a, n, i) => a + n * (i % 2 ? 1 : 3), 0);
  return (10 - s % 10) % 10 === d[11];
}

function receiptCSS() {
  const w = String(SETTINGS.paper_width) === '58' ? 58 : 80;
  const content = w === 58 ? 48 : 72;
  return `@page { size: ${w}mm auto; margin: 0; }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; background: #fff; }
    body { width: ${content}mm; margin: 0 auto; padding: 3mm 0 6mm; color: #000;
      font-family: "Courier New", Consolas, monospace; font-size: ${w === 58 ? 10.5 : 12}px; line-height: 1.35; }
    .c { text-align: center; } .r { text-align: right; } .b { font-weight: 700; }
    .store { font-size: ${w === 58 ? 17 : 21}px; font-weight: 900; letter-spacing: 2px; font-family: Arial, sans-serif; }
    .tag { font-size: 0.9em; }
    hr { border: 0; border-top: 1px dashed #000; margin: 5px 0; }
    table { width: 100%; border-collapse: collapse; }
    td { vertical-align: top; padding: 1px 0; }
    .it-name { word-break: break-word; }
    .big td { font-size: 1.35em; font-weight: 900; padding-top: 3px; }
    .void { border: 2px solid #000; text-align: center; font-weight: 900; font-size: 1.4em; padding: 3px; margin: 4px 0; }
    svg { max-width: 100%; height: auto; display: block; margin: 4px auto 0; }`;
}

function receiptHTML(sale, { copy = false } = {}) {
  const s = SETTINGS;
  const methodName = { cash: t('cash'), card: t('card'), transfer: t('transfer'), other: t('other') }[sale.method] || sale.method;
  const rows = (sale.items || []).map(i => `
    <tr><td colspan="2" class="it-name">${esc(i.name)}</td></tr>
    <tr><td>&nbsp; ${i.qty} x ${fmt(i.price)}</td><td class="r">${fmt(i.total)}</td></tr>`).join('');
  const vatLabel = s.prices_include_vat ? `${t('vat_incl')} ${s.vat_rate}%` : `${t('vat')} ${s.vat_rate}%`;
  return `
    <div class="c store">${esc(s.store_name || 'SAPPHIRE')}</div>
    ${s.store_tagline ? `<div class="c tag">${esc(s.store_tagline)}</div>` : ''}
    ${s.store_address ? `<div class="c">${esc(s.store_address)}</div>` : ''}
    ${s.store_phone ? `<div class="c">Tel: ${esc(s.store_phone)}</div>` : ''}
    <hr>
    ${sale.voided ? `<div class="void">*** ${esc(t('voided')).toUpperCase()} ***</div>` : ''}
    ${copy ? `<div class="c b">-- COPY --</div>` : ''}
    <table>
      <tr><td>${esc(t('invoice'))}</td><td class="r b">${esc(sale.number)}</td></tr>
      <tr><td>${esc(t('date'))}</td><td class="r">${esc(fmtDateTime(sale.date))}</td></tr>
      <tr><td>${esc(t('cashier'))}</td><td class="r">${esc(sale.cashier || '')}</td></tr>
    </table>
    <hr>
    <table>${rows}</table>
    <hr>
    <table>
      <tr><td>${esc(t('subtotal'))} (${sale.items_count || 0} ${esc(t('items'))})</td><td class="r">${fmt(sale.subtotal)}</td></tr>
      ${sale.discount > 0 ? `<tr><td>${esc(t('discount'))}</td><td class="r">-${fmt(sale.discount)}</td></tr>` : ''}
      ${s.vat_enabled || sale.vat > 0 ? `<tr><td>${esc(vatLabel)}</td><td class="r">${fmt(sale.vat)}</td></tr>` : ''}
      <tr class="big"><td>${esc(t('total')).toUpperCase()}</td><td class="r">${fmt(sale.total)}</td></tr>
      <tr><td>${esc(methodName)}</td><td class="r">${fmt(sale.cash != null ? sale.cash : sale.total)}</td></tr>
      ${sale.change != null ? `<tr><td class="b">${esc(t('change'))}</td><td class="r b">${fmt(sale.change)}</td></tr>` : ''}
    </table>
    <hr>
    ${s.receipt_footer ? `<div class="c b">${esc(s.receipt_footer)}</div>` : ''}
    ${s.return_policy ? `<div class="c">${esc(s.return_policy)}</div>` : ''}
    ${barcodeSVG(sale.number, { height: 34, width: 1.4, fontSize: 11, format: 'CODE128' })}
    <div class="c">&nbsp;</div>`;
}

function printReceipt(sale, opts) {
  return printHTML(receiptHTML(sale, opts), receiptCSS());
}

function printDayReport(data, title) {
  const s = SETTINGS;
  const sum = data.summary;
  const html = `
    <div class="c store">${esc(s.store_name || 'SAPPHIRE')}</div>
    <div class="c b">${esc(title)}</div>
    <div class="c">${esc(fmtDateTime(new Date().toISOString()))}</div>
    <hr>
    <table>
      <tr><td>${esc(t('sales'))}</td><td class="r b">${sum.count}</td></tr>
      <tr><td>${esc(t('items'))}</td><td class="r">${sum.items}</td></tr>
      <tr><td>${esc(t('cash'))}</td><td class="r">${fmt(sum.cash)}</td></tr>
      <tr><td>${esc(t('card'))}</td><td class="r">${fmt(sum.card)}</td></tr>
      <tr><td>${esc(t('other'))}</td><td class="r">${fmt(sum.other)}</td></tr>
      <tr class="big"><td>${esc(t('total')).toUpperCase()}</td><td class="r">${fmt(sum.total)}</td></tr>
      ${sum.voided ? `<tr><td>${esc(t('voided'))}</td><td class="r">${sum.voided}</td></tr>` : ''}
    </table>
    <hr>
    <table>${data.sales.map(x => `<tr><td>${esc(fmtTime(x.date))} ${esc(x.number)}${x.voided ? ' X' : ''}</td><td class="r">${fmt(x.total)}</td></tr>`).join('')}</table>
    <hr><div class="c">&nbsp;</div>`;
  return printHTML(html, receiptCSS());
}

/* ---------------- shared header bits ---------------- */
function startClock(el) {
  const tick = () => { el.textContent = new Date().toLocaleString(LANG === 'es' ? 'es' : 'en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit', timeZone: 'America/Nassau' }); };
  tick(); setInterval(tick, 15000);
}

function passwordModal(force = false) {
  const body = document.createElement('div');
  body.style.cssText = 'display:flex;flex-direction:column;gap:12px';
  body.innerHTML = `
    ${force ? `<div class="guide">${esc(t('must_change'))}</div>` : ''}
    <label class="f">${esc(t('current_password'))}<input class="input" type="password" name="cur" autocomplete="current-password"></label>
    <label class="f">${esc(t('new_password'))}<input class="input" type="password" name="n1" autocomplete="new-password"></label>
    <label class="f">${esc(t('repeat_password'))}<input class="input" type="password" name="n2" autocomplete="new-password"></label>
    <div class="login-err" data-err></div>`;
  const foot = document.createElement('div');
  foot.innerHTML = `${force ? '' : `<button class="btn" data-close>${esc(t('cancel'))}</button>`}<button class="btn btn-primary" data-save>${esc(t('save'))}</button>`;
  const m = openModal({ title: t('change_password'), body, footer: foot, closable: !force });
  if (!force) $('[data-close]', foot).onclick = () => m.close();
  const save = async () => {
    const cur = $('[name=cur]', body).value, n1 = $('[name=n1]', body).value, n2 = $('[name=n2]', body).value;
    if (n1 !== n2) { $('[data-err]', body).textContent = t('passwords_dont_match'); return; }
    try {
      await api('/api/me/password', { method: 'POST', body: { current: cur, new: n1 } });
      m.close(); toast(t('password_saved'), 'ok');
      document.dispatchEvent(new CustomEvent('passwordchanged'));
    } catch (e) { $('[data-err]', body).textContent = e.message; }
  };
  $('[data-save]', foot).onclick = save;
  body.addEventListener('keydown', e => { if (e.key === 'Enter') save(); });
}
