/* SAPPHIRE POS — cashier screen */
'use strict';

const state = {
  cart: [],            // {id, name, barcode, price, qty, stock, size, color}
  method: 'cash',
  discount: null,      // {type:'amount'|'percent', value}
  busy: false,
};
const CART_KEY = 'sapphire_cart_v2';

/* ---------- boot ---------- */
(async function init() {
  $('#brand').innerHTML = ICON.gem + '<span>SAPPHIRE</span><small>' + esc(ME.nombre) + '</small>';
  $('#scan-icon').innerHTML = ICON.scan;
  $$('[data-icon]').forEach(el => { el.innerHTML = ICON[el.dataset.icon] || ''; });
  applyI18n();
  startClock($('#clock'));
  await loadSettings();
  restoreCart();
  render();
  focusScan();
  if (ME.must_change) passwordModal(true);
})();

document.addEventListener('langchange', render);
$('#btn-lang').onclick = toggleLang;
$('#btn-pw').onclick = (e) => { e.preventDefault(); passwordModal(false); };

/* ---------- scanning ---------- */
const scan = $('#scan');
function modalOpen() { return !!$('.modal-bg'); }
function focusScan() { setTimeout(() => { if (!modalOpen()) scan.focus(); }, 0); }

scan.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !modalOpen()) {
    e.preventDefault();
    const code = scan.value.trim();
    scan.value = '';
    if (code) handleCode(code);
  }
});

// Scanner guns type very fast and end with Enter. If the cursor is in another field (e.g. cash),
// detect the burst and treat it as a scan instead of typing into that field.
const burst = { chars: '', last: 0, gaps: [] };
document.addEventListener('keydown', (e) => {
  const now = performance.now();
  const el = document.activeElement;
  // While the "sale complete" box is open, a scan starts the next sale right away.
  const doneOpen = !!$('.modal [data-new]');
  if (el === scan || (modalOpen() && !doneOpen)) { burst.chars = ''; burst.gaps = []; return; }
  if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
    if (now - burst.last > 80) { burst.chars = ''; burst.gaps = []; }
    else burst.gaps.push(now - burst.last);
    burst.chars += e.key;
    burst.last = now;
    if (!doneOpen && (!el || !/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) {
      // nothing focused: send keys to the scan box
      e.preventDefault();
      scan.focus();
      scan.value += e.key;
    }
  } else if (e.key === 'Enter' && burst.chars.length >= 4 && now - burst.last < 80) {
    const avg = burst.gaps.reduce((a, b) => a + b, 0) / Math.max(1, burst.gaps.length);
    if (avg < 45) {
      e.preventDefault();
      e.stopPropagation();
      if (doneOpen) $('.modal [data-new]').click();
      if (el && 'value' in el && el.value.endsWith(burst.chars)) {
        el.value = el.value.slice(0, -burst.chars.length);
        el.dispatchEvent(new Event('input'));
      }
      const code = burst.chars;
      burst.chars = '';
      handleCode(code);
      focusScan();
    }
  }
}, true);

// keep the scan box ready after clicks
document.addEventListener('click', (e) => {
  if (modalOpen()) return;
  if (e.target.closest('input, select, textarea, #drawer')) return;
  focusScan();
});

function setStatus(msg, type) {
  const el = $('#scan-status');
  el.textContent = msg || '';
  el.className = 'scan-status ' + (type || '');
  scan.classList.remove('flash-ok', 'flash-bad');
  void scan.offsetWidth;
  if (type === 'ok') scan.classList.add('flash-ok');
  if (type === 'bad') scan.classList.add('flash-bad');
  clearTimeout(setStatus._t);
  setStatus._t = setTimeout(() => scan.classList.remove('flash-ok', 'flash-bad'), 700);
}

async function handleCode(code) {
  // already in cart? just add one (no network round-trip)
  const inCart = state.cart.find(i => i.barcode === code);
  if (inCart) return addToCart(inCart);
  try {
    const p = await api('/api/products/barcode/' + encodeURIComponent(code));
    addToCart(p);
  } catch (e) {
    beep(false);
    setStatus(e.code === 'not_found' ? `${t('not_found')}: ${code}` : e.message, 'bad');
  }
}

function addToCart(p) {
  const line = state.cart.find(i => i.id === p.id);
  const want = (line ? line.qty : 0) + 1;
  const stock = line ? line.stock : p.stock;
  if (!SETTINGS.allow_negative_stock && want > stock) {
    beep(false);
    setStatus(stock <= 0 ? `${t('out_of_stock')}: ${p.name}` : t('only_left', { n: stock }) + ` — ${p.name}`, 'bad');
    return;
  }
  if (line) {
    line.qty = want;
    state.cart.splice(state.cart.indexOf(line), 1);
    state.cart.unshift(line);           // most recent on top
  } else {
    state.cart.unshift({ id: p.id, name: p.name, barcode: p.barcode, price: p.price, qty: 1, stock: p.stock, size: p.size, color: p.color });
  }
  beep(true);
  setStatus(`${t('added')}: ${p.name} — ${fmt(p.price)}`, 'ok');
  render();
}

function changeQty(id, delta) {
  const line = state.cart.find(i => i.id === id);
  if (!line) return;
  const q = line.qty + delta;
  if (q <= 0) return removeLine(id);
  if (!SETTINGS.allow_negative_stock && q > line.stock) { beep(false); setStatus(t('only_left', { n: line.stock }), 'bad'); return; }
  line.qty = q;
  render();
}
function removeLine(id) {
  const line = state.cart.find(i => i.id === id);
  state.cart = state.cart.filter(i => i.id !== id);
  if (line) setStatus(`${t('removed')}: ${line.name}`);
  render();
}

/* ---------- totals (display only — the server recalculates everything) ---------- */
function totals() {
  const subtotal = round2(state.cart.reduce((a, i) => a + i.price * i.qty, 0));
  let discount = 0;
  if (state.discount) discount = state.discount.type === 'percent' ? subtotal * state.discount.value / 100 : state.discount.value;
  discount = round2(Math.min(Math.max(discount, 0), subtotal));
  const taxable = subtotal - discount;
  const rate = SETTINGS.vat_enabled ? SETTINGS.vat_rate / 100 : 0;
  let vat, total;
  if (rate && SETTINGS.prices_include_vat) { total = round2(taxable); vat = round2(taxable - taxable / (1 + rate)); }
  else { vat = round2(taxable * rate); total = round2(taxable + vat); }
  const count = state.cart.reduce((a, i) => a + i.qty, 0);
  return { subtotal, discount, vat, total, count };
}

function cashValue() {
  const v = parseFloat(String($('#cash-in').value).replace(/[^0-9.]/g, ''));
  return isNaN(v) ? null : v;
}

/* ---------- render ---------- */
function render() {
  const cart = $('#cart');
  if (!state.cart.length) {
    cart.innerHTML = `<div class="cart-empty">${ICON.bag}<b>${esc(t('scan_to_start'))}</b><span>${esc(t('scan_hint'))}</span></div>`;
  } else {
    cart.innerHTML = `<table class="t"><thead><tr>
        <th>${esc(t('item'))}</th><th style="width:150px">${esc(t('qty'))}</th>
        <th class="right">${esc(t('price'))}</th><th class="right">${esc(t('total'))}</th><th style="width:44px"></th></tr></thead>
      <tbody>${state.cart.map(i => `<tr>
        <td><div class="item-name">${esc(i.name)}</div>
          <div class="muted small mono">${esc(i.barcode)}${i.size ? ' · ' + esc(i.size) : ''}${i.color ? ' · ' + esc(i.color) : ''}</div></td>
        <td><div class="qty"><button data-q="-1" data-id="${i.id}" aria-label="minus">−</button><span>${i.qty}</span><button data-q="1" data-id="${i.id}" aria-label="plus">+</button></div></td>
        <td class="right nowrap">${fmt(i.price)}</td>
        <td class="right nowrap"><b>${fmt(i.price * i.qty)}</b></td>
        <td><button class="btn btn-sm btn-icon btn-danger" data-rm="${i.id}" aria-label="remove">${ICON.trash}</button></td>
      </tr>`).join('')}</tbody></table>`;
    $$('[data-q]', cart).forEach(b => b.onclick = () => changeQty(+b.dataset.id, +b.dataset.q));
    $$('[data-rm]', cart).forEach(b => b.onclick = () => removeLine(+b.dataset.rm));
  }

  const tt = totals();
  $('#t-count').textContent = tt.count ? `(${tt.count} ${t('items')})` : '';
  $('#t-sub').textContent = fmt(tt.subtotal);
  $('#row-disc').classList.toggle('hidden', !tt.discount);
  $('#t-disc').textContent = '-' + fmt(tt.discount) + (state.discount?.type === 'percent' ? ` (${state.discount.value}%)` : '');
  $('#row-vat').classList.toggle('hidden', !SETTINGS.vat_enabled);
  $('#t-vat-lbl').textContent = `${SETTINGS.prices_include_vat ? t('vat_incl') : t('vat')} ${SETTINGS.vat_rate}%`;
  $('#t-vat').textContent = fmt(tt.vat);
  $('#t-total').textContent = fmt(tt.total);
  $('#charge-amt').textContent = tt.total ? fmt(tt.total) : '';
  $('#charge').disabled = !state.cart.length || state.busy;
  $('#btn-disc').textContent = state.discount ? `${t('discount')}: ${state.discount.type === 'percent' ? state.discount.value + '%' : fmt(state.discount.value)}` : t('add_discount');

  $$('#pay-methods .pay-btn').forEach(b => b.classList.toggle('active', b.dataset.m === state.method));
  $('#cash-box').classList.toggle('hidden', state.method !== 'cash');
  renderCash(tt);
  saveCart();
}

function renderCash(tt = totals()) {
  const quick = $('#cash-quick');
  const opts = [];
  if (tt.total > 0) {
    opts.push({ label: t('exact'), v: tt.total });
    for (const step of [5, 10, 20, 50, 100]) {
      const v = Math.ceil(tt.total / step) * step;
      if (v > tt.total && !opts.some(o => o.v === v)) opts.push({ label: fmt(v).replace('.00', ''), v });
      if (opts.length >= 4) break;
    }
  }
  quick.innerHTML = opts.map(o => `<button type="button" data-v="${o.v}">${esc(o.label)}</button>`).join('');
  $$('button', quick).forEach(b => b.onclick = () => { $('#cash-in').value = Number(b.dataset.v).toFixed(2); renderCash(); });
  const cash = cashValue();
  const row = $('#change-row');
  if (cash == null || !tt.total) { row.classList.add('hidden'); return; }
  row.classList.remove('hidden');
  const diff = round2(cash - tt.total);
  row.classList.toggle('short', diff < 0);
  $('#change-lbl').textContent = diff < 0 ? t('short') : t('change');
  $('#change-amt').textContent = fmt(Math.abs(diff));
}
$('#cash-in').addEventListener('input', () => renderCash());
$('#cash-in').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); charge(); } });

$$('#pay-methods .pay-btn').forEach(b => b.onclick = () => {
  state.method = b.dataset.m;
  render();
  if (state.method === 'cash') setTimeout(() => $('#cash-in').focus(), 0);
});

/* ---------- persistence (survives an accidental refresh) ---------- */
function saveCart() {
  try { localStorage.setItem(CART_KEY, JSON.stringify({ cart: state.cart, discount: state.discount, method: state.method })); } catch (e) {}
}
function restoreCart() {
  try {
    const d = JSON.parse(localStorage.getItem(CART_KEY) || 'null');
    if (d && Array.isArray(d.cart)) { state.cart = d.cart; state.discount = d.discount || null; state.method = d.method || 'cash'; }
  } catch (e) {}
}
function resetSale() {
  state.cart = []; state.discount = null; state.method = 'cash';
  $('#cash-in').value = '';
  setStatus('');
  render();
  focusScan();
}

/* ---------- charge ---------- */
async function charge() {
  if (!state.cart.length || state.busy) return;
  const tt = totals();
  const cash = state.method === 'cash' ? cashValue() : null;
  if (cash != null && cash < tt.total) { beep(false); toast(t('cash_not_enough'), 'bad'); $('#cash-in').focus(); return; }
  state.busy = true; render();
  try {
    const sale = await api('/api/sales', { method: 'POST', body: {
      items: state.cart.map(i => ({ id: i.id, qty: i.qty })),
      method: state.method,
      cash_received: cash != null ? cash : (state.method === 'cash' ? tt.total : null),
      discount_type: state.discount?.type, discount_value: state.discount?.value || 0,
    }});
    state.busy = false;
    resetSale();
    showDone(sale);
    if (SETTINGS.auto_print) printReceipt(sale);
  } catch (e) {
    state.busy = false; render();
    beep(false);
    toast(e.message, 'bad');
    if (e.code === 'insufficient_stock' && e.data) {
      const line = state.cart.find(i => i.id === e.data.product_id);
      if (line) { line.stock = e.data.stock; render(); }
    }
  }
}
$('#charge').onclick = charge;

function showDone(sale) {
  const body = `<div class="done-card">
      <div class="done-check">${ICON.check}</div>
      <div class="muted">${esc(t('sale_complete'))} · <span class="mono">${esc(sale.number)}</span></div>
      <div class="done-total">${fmt(sale.total)}</div>
      ${sale.change != null && sale.change > 0 ? `<div class="done-change">${esc(t('change'))}: ${fmt(sale.change)}</div>` : ''}
    </div>`;
  const foot = document.createElement('div');
  foot.style.cssText = 'display:flex;gap:10px;width:100%';
  foot.innerHTML = `<button class="btn grow" data-print>🖨 ${esc(SETTINGS.auto_print ? t('reprint') : t('print_receipt'))}</button>
    <button class="btn btn-primary grow" data-new>${esc(t('new_sale'))} <kbd>Enter</kbd></button>`;
  const m = openModal({ title: t('sale_complete'), body, footer: foot, onClose: focusScan });
  $('[data-print]', foot).onclick = () => printReceipt(sale);
  $('[data-new]', foot).onclick = () => m.close();
  setTimeout(() => $('[data-new]', foot).focus(), 50);
}

/* ---------- clear / discount / search ---------- */
async function clearSale() {
  if (!state.cart.length) return;
  if (await confirmBox(t('confirm_clear'), { okText: t('clear_sale'), danger: true })) resetSale();
  else focusScan();
}
$('#btn-clear').onclick = clearSale;

$('#btn-disc').onclick = () => {
  const d = state.discount || { type: 'amount', value: '' };
  const body = `
    <div class="row">
      <label class="check"><input type="radio" name="dt" value="amount" ${d.type !== 'percent' ? 'checked' : ''}> ${esc(t('amount'))}</label>
      <label class="check"><input type="radio" name="dt" value="percent" ${d.type === 'percent' ? 'checked' : ''}> ${esc(t('percent'))}</label>
    </div>
    <input class="input" name="dv" inputmode="decimal" value="${d.value}" placeholder="0" style="font-size:22px;font-weight:800">`;
  const foot = document.createElement('div');
  foot.innerHTML = `<button class="btn btn-danger" data-rm>${esc(t('remove'))}</button><button class="btn btn-primary" data-ok>${esc(t('apply'))}</button>`;
  const m = openModal({ title: t('discount_title'), body, footer: foot, onClose: focusScan });
  const apply = () => {
    const type = $('[name=dt]:checked', m).value;
    const v = parseFloat($('[name=dv]', m).value);
    state.discount = (!isNaN(v) && v > 0) ? { type, value: type === 'percent' ? Math.min(v, 100) : v } : null;
    m.close(); render();
  };
  $('[data-ok]', foot).onclick = apply;
  $('[data-rm]', foot).onclick = () => { state.discount = null; m.close(); render(); };
  $('[name=dv]', m).addEventListener('keydown', e => { if (e.key === 'Enter') apply(); });
};

function openSearch() {
  const body = document.createElement('div');
  body.style.cssText = 'display:flex;flex-direction:column;gap:12px';
  body.innerHTML = `<input class="input" name="q" placeholder="${esc(t('search_name'))}" autocomplete="off" style="font-size:18px">
    <div class="search-results" data-res><div class="empty">…</div></div>`;
  const m = openModal({ title: t('search_name'), body, wide: true, onClose: focusScan });
  const input = $('[name=q]', body), res = $('[data-res]', body);
  let items = [], sel = 0, timer;
  const draw = () => {
    if (!items.length) { res.innerHTML = `<div class="empty">${esc(t('not_found'))}</div>`; return; }
    res.innerHTML = items.map((p, i) => `<div class="sr ${i === sel ? 'sel' : ''}" data-i="${i}">
      <div><b>${esc(p.name)}</b><div class="muted small">${esc(p.category)}${p.size ? ' · ' + esc(p.size) : ''}${p.color ? ' · ' + esc(p.color) : ''} · <span class="mono">${esc(p.barcode)}</span></div></div>
      <div class="right nowrap"><b>${fmt(p.price)}</b><div class="small ${p.stock > 0 ? 'muted' : 'down'}">${p.stock} in stock</div></div></div>`).join('');
    $$('.sr', res).forEach(el => el.onclick = () => pick(+el.dataset.i));
  };
  const pick = (i) => { const p = items[i]; if (p) { m.close(); addToCart(p); } };
  const load = async () => {
    try { items = await api('/api/products?q=' + encodeURIComponent(input.value.trim())); sel = 0; draw(); } catch (e) { res.innerHTML = `<div class="empty">${esc(e.message)}</div>`; }
  };
  input.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(load, 180); });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(items.length - 1, sel + 1); draw(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(0, sel - 1); draw(); }
    if (e.key === 'Enter') { e.preventDefault(); pick(sel); }
  });
  load();
}
$('#btn-search').onclick = openSearch;

/* ---------- keyboard shortcuts ---------- */
document.addEventListener('keydown', (e) => {
  if (modalOpen()) {
    if (e.key === 'Enter' && $('.modal [data-new]') && (document.activeElement?.tagName !== 'INPUT' || document.activeElement === scan)) { e.preventDefault(); $('.modal [data-new]').click(); }
    return;
  }
  if (e.key === 'F2') { e.preventDefault(); openSearch(); }
  else if (e.key === 'F9') { e.preventDefault(); charge(); }
  else if (e.key === 'F4') { e.preventDefault(); state.method = 'cash'; render(); $('#cash-in').focus(); }
  else if (e.key === 'Escape' && !$('#drawer').classList.contains('hidden')) { e.preventDefault(); closeDrawer(); }
  else if (e.key === 'Escape') { e.preventDefault(); clearSale(); }
});

/* ---------- today's sales drawer ---------- */
let todayData = null;
async function openDrawer() {
  $('#drawer').classList.remove('hidden');
  $('#drawer-list').innerHTML = '<div class="empty">…</div>';
  try {
    todayData = await api('/api/sales');
    const s = todayData.summary;
    $('#drawer-sum').innerHTML = `
      <div class="mini"><div class="k">${esc(t('sales'))}</div><div class="v">${s.count}</div></div>
      <div class="mini"><div class="k">${esc(t('cash'))}</div><div class="v">${fmt(s.cash)}</div></div>
      <div class="mini"><div class="k">${esc(t('total'))}</div><div class="v">${fmt(s.total)}</div></div>`;
    if (!todayData.sales.length) { $('#drawer-list').innerHTML = `<div class="empty">${esc(t('no_sales_today'))}</div>`; return; }
    $('#drawer-list').innerHTML = `<table class="t"><thead><tr><th>${esc(t('time'))}</th><th>${esc(t('receipt'))}</th><th>${esc(t('method'))}</th><th class="right">${esc(t('total'))}</th></tr></thead><tbody>
      ${todayData.sales.map(x => `<tr class="clickable" data-id="${x.id}">
        <td class="nowrap">${esc(fmtTime(x.date))}</td>
        <td><span class="mono">${esc(x.number)}</span> <span class="muted small">· ${x.items_count} ${esc(t('items'))}</span>${x.voided ? ` <span class="badge b-bad">${esc(t('voided'))}</span>` : ''}</td>
        <td>${esc(t(x.method))}</td>
        <td class="right nowrap"><b>${fmt(x.total)}</b></td></tr>`).join('')}</tbody></table>`;
    $$('#drawer-list tr[data-id]').forEach(tr => tr.onclick = () => showSale(+tr.dataset.id));
  } catch (e) { $('#drawer-list').innerHTML = `<div class="empty">${esc(e.message)}</div>`; }
}
function closeDrawer() { $('#drawer').classList.add('hidden'); focusScan(); }
$('#btn-today').onclick = () => $('#drawer').classList.contains('hidden') ? openDrawer() : closeDrawer();
$('#drawer-close').onclick = closeDrawer;
$('#btn-zreport').onclick = async () => {
  if (!todayData) await openDrawer();
  if (todayData) printDayReport(todayData, t('today_sales') + ' — ' + new Date().toLocaleDateString(LANG === 'es' ? 'es' : 'en-US', { timeZone: 'America/Nassau', dateStyle: 'medium' }));
};

async function showSale(id) {
  try {
    const s = await api('/api/sales/' + id);
    const body = `
      <div class="row wrap"><span class="mono b">${esc(s.number)}</span><span class="muted">${esc(fmtDateTime(s.date))} · ${esc(s.cashier)}</span>
        ${s.voided ? `<span class="badge b-bad">${esc(t('voided'))}</span>` : ''}</div>
      <table class="t"><tbody>${s.items.map(i => `<tr><td>${esc(i.name)}<div class="muted small mono">${esc(i.barcode)}</div></td><td class="nowrap">${i.qty} × ${fmt(i.price)}</td><td class="right"><b>${fmt(i.total)}</b></td></tr>`).join('')}</tbody></table>
      <div class="totals" style="padding:0">
        <div class="tot-row"><span>${esc(t('subtotal'))}</span><span>${fmt(s.subtotal)}</span></div>
        ${s.discount ? `<div class="tot-row disc"><span>${esc(t('discount'))}</span><span>-${fmt(s.discount)}</span></div>` : ''}
        <div class="tot-row"><span>${esc(t('vat'))}</span><span>${fmt(s.vat)}</span></div>
        <div class="tot-row"><b>${esc(t('total'))}</b><b>${fmt(s.total)}</b></div>
        <div class="tot-row muted"><span>${esc(t(s.method))}</span><span>${s.change != null ? esc(t('change')) + ' ' + fmt(s.change) : ''}</span></div>
      </div>`;
    const foot = document.createElement('div');
    foot.innerHTML = `<button class="btn" data-close>${esc(t('close'))}</button><button class="btn btn-primary" data-print>🖨 ${esc(t('reprint'))}</button>`;
    const m = openModal({ title: t('receipt') + ' ' + s.number, body, footer: foot });
    $('[data-close]', foot).onclick = () => m.close();
    $('[data-print]', foot).onclick = () => printReceipt(s, { copy: true });
  } catch (e) { toast(e.message, 'bad'); }
}
