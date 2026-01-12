let cart = [];
let selectedPaymentMethod = 'cash';
let vatEnabled = true;

const barcodeInput = document.getElementById('barcode-input');
const cartItems = document.getElementById('cart-items');
const subtotalDisplay = document.getElementById('subtotal-display');
const vatDisplay = document.getElementById('itbis-display');
const totalDisplay = document.getElementById('total-display');
const checkoutBtn = document.getElementById('checkout-btn');
const cancelBtn = document.getElementById('cancel-btn');
const clearCartBtn = document.getElementById('clear-cart');
const modal = document.getElementById('success-modal');
const nuevaVentaBtn = document.getElementById('nueva-venta-btn');

// Load VAT config
async function loadVatConfig() {
    try {
        const res = await fetch('/api/config/vat');
        const data = await res.json();
        vatEnabled = data.vat_enabled;
        actualizarTotales();
    } catch (e) { console.error(e); }
}
loadVatConfig();

document.querySelectorAll('.payment-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.payment-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedPaymentMethod = btn.dataset.method;
    });
});

barcodeInput.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        const barcode = barcodeInput.value.trim();
        if (barcode) {
            await agregarProducto(barcode);
            barcodeInput.value = '';
        }
    }
});

async function agregarProducto(barcode) {
    try {
        const response = await fetch(`/api/products/${barcode}`);
        if (!response.ok) { mostrarError(t('product_not_found')); return; }
        const producto = await response.json();
        if (producto.cantidad_stock <= 0) { mostrarError(t('out_of_stock')); return; }
        
        const itemExistente = cart.find(item => item.id === producto.id);
        if (itemExistente) {
            if (itemExistente.cantidad >= producto.cantidad_stock) { mostrarError(t('insufficient_stock')); return; }
            itemExistente.cantidad++;
        } else {
            cart.push({ id: producto.id, codigo_barra: producto.codigo_barra, nombre: producto.nombre, precio: producto.precio, cantidad: 1, stock: producto.cantidad_stock });
        }
        renderizarCarrito();
        actualizarTotales();
        mostrarExito();
    } catch (error) { mostrarError('Error'); }
}

function renderizarCarrito() {
    if (cart.length === 0) {
        cartItems.innerHTML = `<div class="empty-cart"><p>🛍️ ${t('empty_cart')}</p><p>${t('scan_to_start')}</p></div>`;
        checkoutBtn.disabled = true;
        return;
    }
    checkoutBtn.disabled = false;
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="item-info"><div class="item-name">${item.nombre}</div><div class="item-price">$${item.precio.toFixed(2)}</div></div>
            <div class="item-controls">
                <button class="quantity-btn" onclick="cambiarCantidad(${item.id}, -1)">-</button>
                <input type="number" class="quantity-input" value="${item.cantidad}" onchange="actualizarCantidad(${item.id}, this.value)" min="1">
                <button class="quantity-btn" onclick="cambiarCantidad(${item.id}, 1)">+</button>
                <button class="remove-item" onclick="eliminarItem(${item.id})">🗑️</button>
            </div>
        </div>
    `).join('');
}

function cambiarCantidad(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    const nueva = item.cantidad + delta;
    if (nueva <= 0) { eliminarItem(id); return; }
    if (nueva > item.stock) { mostrarError(t('insufficient_stock')); return; }
    item.cantidad = nueva;
    renderizarCarrito();
    actualizarTotales();
}

function actualizarCantidad(id, val) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    val = parseInt(val);
    if (isNaN(val) || val <= 0) { eliminarItem(id); return; }
    if (val > item.stock) { mostrarError(t('insufficient_stock')); renderizarCarrito(); return; }
    item.cantidad = val;
    actualizarTotales();
}

function eliminarItem(id) {
    cart = cart.filter(item => item.id !== id);
    renderizarCarrito();
    actualizarTotales();
}

clearCartBtn.addEventListener('click', () => {
    if (cart.length === 0) return;
    if (confirm(t('clear') + '?')) { cart = []; renderizarCarrito(); actualizarTotales(); barcodeInput.focus(); }
});

function actualizarTotales() {
    const subtotal = cart.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    const vat = vatEnabled ? subtotal * 0.10 : 0;
    const total = subtotal + vat;
    subtotalDisplay.textContent = `$${subtotal.toFixed(2)}`;
    vatDisplay.textContent = vatEnabled ? `$${vat.toFixed(2)}` : '$0.00';
    totalDisplay.textContent = `$${total.toFixed(2)}`;
    
    // Update VAT label visibility
    const vatRow = document.querySelector('.vat-row');
    if (vatRow) {
        vatRow.style.display = vatEnabled ? 'flex' : 'none';
    }
}

checkoutBtn.addEventListener('click', async () => {
    if (cart.length === 0) return;
    if (!confirm(t('confirm_sale'))) return;
    
    const subtotal = cart.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    
    const ventaData = {
        items: cart.map(item => ({ id: item.id, nombre: item.nombre, cantidad: item.cantidad, precio: item.precio, subtotal: item.precio * item.cantidad })),
        subtotal: subtotal,
        vat: 0,
        total: subtotal,
        payment_method: selectedPaymentMethod
    };
    
    try {
        checkoutBtn.disabled = true;
        checkoutBtn.textContent = t('processing');
        const response = await fetch('/api/sales', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(ventaData) });
        const result = await response.json();
        
        if (result.success) {
            document.getElementById('factura-number').textContent = result.invoice_number;
            document.getElementById('factura-total').textContent = `$${result.total.toFixed(2)}`;
            modal.classList.add('show');
            cart = [];
            renderizarCarrito();
            actualizarTotales();
        } else { throw new Error(result.message); }
    } catch (error) { alert('Error: ' + error.message); }
    finally { checkoutBtn.disabled = false; checkoutBtn.textContent = '✅ ' + t('process_sale'); }
});

cancelBtn.addEventListener('click', () => { if (cart.length > 0 && confirm(t('cancel') + '?')) { cart = []; renderizarCarrito(); actualizarTotales(); barcodeInput.focus(); } });
nuevaVentaBtn.addEventListener('click', () => { modal.classList.remove('show'); barcodeInput.focus(); });
modal.addEventListener('click', (e) => { if (e.target === modal) { modal.classList.remove('show'); barcodeInput.focus(); } });

document.addEventListener('keydown', (e) => {
    if (e.key === 'F1') { e.preventDefault(); barcodeInput.focus(); }
    if (e.key === 'F2') { e.preventDefault(); cancelBtn.click(); }
    if (e.key === 'F3') { e.preventDefault(); if (!checkoutBtn.disabled) checkoutBtn.click(); }
});

function mostrarError(msg) { barcodeInput.style.borderColor = 'red'; setTimeout(() => barcodeInput.style.borderColor = '', 1000); console.error(msg); }
function mostrarExito() { barcodeInput.style.borderColor = 'green'; setTimeout(() => barcodeInput.style.borderColor = '', 500); }
window.addEventListener('load', () => barcodeInput.focus());
