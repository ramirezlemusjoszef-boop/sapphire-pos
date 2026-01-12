let cart = [];
let selectedPaymentMethod = 'efectivo';

const barcodeInput = document.getElementById('barcode-input');
const cartItems = document.getElementById('cart-items');
const subtotalDisplay = document.getElementById('subtotal-display');
const itbisDisplay = document.getElementById('itbis-display');
const totalDisplay = document.getElementById('total-display');
const checkoutBtn = document.getElementById('checkout-btn');
const cancelBtn = document.getElementById('cancel-btn');
const clearCartBtn = document.getElementById('clear-cart');
const modal = document.getElementById('success-modal');
const nuevaVentaBtn = document.getElementById('nueva-venta-btn');

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
        if (!response.ok) { mostrarError('Producto no encontrado'); return; }
        const producto = await response.json();
        if (producto.cantidad_stock <= 0) { mostrarError('Sin stock'); return; }
        
        const itemExistente = cart.find(item => item.id === producto.id);
        if (itemExistente) {
            if (itemExistente.cantidad >= producto.cantidad_stock) { mostrarError('Stock insuficiente'); return; }
            itemExistente.cantidad++;
        } else {
            cart.push({ id: producto.id, codigo_barra: producto.codigo_barra, nombre: producto.nombre, precio: producto.precio, cantidad: 1, stock: producto.cantidad_stock });
        }
        renderizarCarrito();
        actualizarTotales();
    } catch (error) { mostrarError('Error'); }
}

function renderizarCarrito() {
    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="empty-cart"><p>🛍️ Carrito vacío</p></div>';
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
    if (nueva > item.stock) { mostrarError('Stock insuficiente'); return; }
    item.cantidad = nueva;
    renderizarCarrito();
    actualizarTotales();
}

function actualizarCantidad(id, val) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    val = parseInt(val);
    if (isNaN(val) || val <= 0) { eliminarItem(id); return; }
    if (val > item.stock) { mostrarError('Stock insuficiente'); renderizarCarrito(); return; }
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
    if (confirm('¿Limpiar carrito?')) { cart = []; renderizarCarrito(); actualizarTotales(); barcodeInput.focus(); }
});

function actualizarTotales() {
    const subtotal = cart.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    const vat = subtotal * 0.10;
    const total = subtotal + vat;
    subtotalDisplay.textContent = `$${subtotal.toFixed(2)}`;
    itbisDisplay.textContent = `$${vat.toFixed(2)}`;
    totalDisplay.textContent = `$${total.toFixed(2)}`;
}

function imprimirRecibo(invoice, items, subtotal, vat, total, payment) {
    const w = window.open('', '_blank', 'width=350,height=600');
    let itemsHTML = items.map(i => `<tr><td>${i.nombre}</td><td>${i.cantidad}</td><td>$${i.subtotal.toFixed(2)}</td></tr>`).join('');
    w.document.write(`<!DOCTYPE html><html><head><style>
        *{margin:0;padding:0;font-family:'Courier New',monospace}
        body{width:280px;padding:10px;font-size:12px}
        .header{text-align:center;border-bottom:1px dashed #000;padding-bottom:10px;margin-bottom:10px}
        .title{font-size:18px;font-weight:bold}
        table{width:100%;margin:10px 0}
        th,td{padding:3px;text-align:left}
        .totals{border-top:1px dashed #000;padding-top:10px;margin-top:10px}
        .total-line{display:flex;justify-content:space-between;margin:3px 0}
        .grand{font-size:16px;font-weight:bold;border:1px solid #000;padding:5px}
        .footer{text-align:center;margin-top:15px;border-top:1px dashed #000;padding-top:10px}
    </style></head><body>
        <div class="header"><div class="title">💎 SAPPHIRE</div><div>LUXURY FASHION HOUSE</div><div>Nassau, Bahamas</div></div>
        <div><strong>Invoice:</strong> ${invoice}</div>
        <div><strong>Date:</strong> ${new Date().toLocaleString()}</div>
        <table><thead><tr><th>Item</th><th>Qty</th><th>Price</th></tr></thead><tbody>${itemsHTML}</tbody></table>
        <div class="totals">
            <div class="total-line"><span>Subtotal:</span><span>$${subtotal.toFixed(2)}</span></div>
            <div class="total-line"><span>VAT 10%:</span><span>$${vat.toFixed(2)}</span></div>
            <div class="total-line grand"><span>TOTAL:</span><span>$${total.toFixed(2)}</span></div>
        </div>
        <div style="text-align:center;margin:10px;padding:5px;background:#eee">Payment: ${payment.toUpperCase()}</div>
        <div class="footer"><p>Thank you!</p><p><strong>For The Distinguished Few</strong></p></div>
        <script>window.onload=function(){window.print();setTimeout(function(){window.close()},500)}</script>
    </body></html>`);
    w.document.close();
}

checkoutBtn.addEventListener('click', async () => {
    if (cart.length === 0) return;
    if (!confirm('¿Confirmar venta?')) return;
    
    const subtotal = cart.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    const vat = subtotal * 0.10;
    const total = subtotal + vat;
    
    const ventaData = {
        items: cart.map(item => ({ id: item.id, nombre: item.nombre, cantidad: item.cantidad, precio: item.precio, subtotal: item.precio * item.cantidad })),
        subtotal, vat, total, payment_method: selectedPaymentMethod
    };
    
    try {
        checkoutBtn.disabled = true;
        checkoutBtn.textContent = 'Procesando...';
        const response = await fetch('/api/sales', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(ventaData) });
        const result = await response.json();
        
        if (result.success) {
            imprimirRecibo(result.invoice_number, ventaData.items, subtotal, vat, total, selectedPaymentMethod);
            document.getElementById('factura-number').textContent = result.invoice_number;
            document.getElementById('factura-total').textContent = `$${total.toFixed(2)}`;
            modal.classList.add('show');
            cart = [];
            renderizarCarrito();
            actualizarTotales();
        } else { throw new Error(result.message); }
    } catch (error) { alert('Error: ' + error.message); }
    finally { checkoutBtn.disabled = false; checkoutBtn.textContent = '✅ Process Sale'; }
});

cancelBtn.addEventListener('click', () => { if (cart.length > 0 && confirm('¿Cancelar?')) { cart = []; renderizarCarrito(); actualizarTotales(); barcodeInput.focus(); } });
nuevaVentaBtn.addEventListener('click', () => { modal.classList.remove('show'); barcodeInput.focus(); });
modal.addEventListener('click', (e) => { if (e.target === modal) { modal.classList.remove('show'); barcodeInput.focus(); } });

document.addEventListener('keydown', (e) => {
    if (e.key === 'F1') { e.preventDefault(); barcodeInput.focus(); }
    if (e.key === 'F2') { e.preventDefault(); cancelBtn.click(); }
    if (e.key === 'F3') { e.preventDefault(); if (!checkoutBtn.disabled) checkoutBtn.click(); }
});

function mostrarError(msg) { barcodeInput.style.borderColor = 'red'; setTimeout(() => barcodeInput.style.borderColor = '', 1000); }
window.addEventListener('load', () => barcodeInput.focus());
