// Estado del carrito
let cart = [];
let selectedPaymentMethod = 'efectivo';

// Elementos del DOM
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

// Listeners de métodos de pago
document.querySelectorAll('.payment-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.payment-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedPaymentMethod = btn.dataset.method;
    });
});

// Escaneo de código de barras
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

// Buscar y agregar producto al carrito
async function agregarProducto(barcode) {
    try {
        const response = await fetch(`/api/products/${barcode}`);
        
        if (!response.ok) {
            mostrarError('Producto no encontrado');
            return;
        }
        
        const producto = await response.json();
        
        // Verificar stock
        if (producto.cantidad_stock <= 0) {
            mostrarError('Producto sin stock');
            return;
        }
        
        // Buscar si ya está en el carrito
        const itemExistente = cart.find(item => item.id === producto.id);
        
        if (itemExistente) {
            // Verificar que no exceda el stock
            if (itemExistente.cantidad >= producto.cantidad_stock) {
                mostrarError('No hay suficiente stock');
                return;
            }
            itemExistente.cantidad++;
        } else {
            cart.push({
                id: producto.id,
                codigo_barra: producto.codigo_barra,
                nombre: producto.nombre,
                precio: producto.precio,
                cantidad: 1,
                stock: producto.cantidad_stock
            });
        }
        
        renderizarCarrito();
        actualizarTotales();
        
        // Sonido de éxito (opcional)
        mostrarExito('Producto agregado');
        
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error al buscar producto');
    }
}

// Renderizar carrito
function renderizarCarrito() {
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <p>🛍️ El carrito está vacío</p>
                <p>Escanee un producto para comenzar</p>
            </div>
        `;
        checkoutBtn.disabled = true;
        return;
    }
    
    checkoutBtn.disabled = false;
    
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item" data-id="${item.id}">
            <div class="item-info">
                <div class="item-name">${item.nombre}</div>
                <div class="item-price">$${item.precio.toFixed(2)} c/u</div>
            </div>
            <div class="item-controls">
                <button class="quantity-btn" onclick="cambiarCantidad(${item.id}, -1)">-</button>
                <input type="number" class="quantity-input" value="${item.cantidad}" 
                    onchange="actualizarCantidad(${item.id}, this.value)" min="1" max="${item.stock}">
                <button class="quantity-btn" onclick="cambiarCantidad(${item.id}, 1)">+</button>
                <button class="remove-item" onclick="eliminarItem(${item.id})">🗑️</button>
            </div>
        </div>
    `).join('');
}

// Cambiar cantidad
function cambiarCantidad(itemId, delta) {
    const item = cart.find(i => i.id === itemId);
    if (!item) return;
    
    const nuevaCantidad = item.cantidad + delta;
    
    if (nuevaCantidad <= 0) {
        eliminarItem(itemId);
        return;
    }
    
    if (nuevaCantidad > item.stock) {
        mostrarError('No hay suficiente stock');
        return;
    }
    
    item.cantidad = nuevaCantidad;
    renderizarCarrito();
    actualizarTotales();
}

// Actualizar cantidad desde input
function actualizarCantidad(itemId, nuevaCantidad) {
    const item = cart.find(i => i.id === itemId);
    if (!item) return;
    
    nuevaCantidad = parseInt(nuevaCantidad);
    
    if (isNaN(nuevaCantidad) || nuevaCantidad <= 0) {
        eliminarItem(itemId);
        return;
    }
    
    if (nuevaCantidad > item.stock) {
        mostrarError('No hay suficiente stock');
        renderizarCarrito();
        return;
    }
    
    item.cantidad = nuevaCantidad;
    actualizarTotales();
}

// Eliminar item del carrito
function eliminarItem(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    renderizarCarrito();
    actualizarTotales();
}

// Limpiar carrito
clearCartBtn.addEventListener('click', () => {
    if (cart.length === 0) return;
    
    if (confirm('¿Desea limpiar el carrito?')) {
        cart = [];
        renderizarCarrito();
        actualizarTotales();
        barcodeInput.focus();
    }
});

// Actualizar totales
function actualizarTotales() {
    const subtotal = cart.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    const vat = subtotal * 0.10; // 10% VAT (Bahamas)
    const total = subtotal + vat;
    
    subtotalDisplay.textContent = `$${subtotal.toFixed(2)}`;
    itbisDisplay.textContent = `$${vat.toFixed(2)}`;
    totalDisplay.textContent = `$${total.toFixed(2)}`;
}

// Procesar venta
checkoutBtn.addEventListener('click', async () => {
    if (cart.length === 0) return;
    
    if (!confirm('Confirm sale?')) return;
    
    const subtotal = cart.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    const vat = subtotal * 0.10; // 10% VAT (Bahamas)
    const total = subtotal + vat;
    
    const ventaData = {
        items: cart.map(item => ({
            id: item.id,
            cantidad: item.cantidad,
            precio: item.precio,
            subtotal: item.precio * item.cantidad
        })),
        subtotal: subtotal,
        vat: vat,
        total: total,
        payment_method: selectedPaymentMethod
    };
    
    try {
        checkoutBtn.disabled = true;
        checkoutBtn.textContent = 'Processing...';
        
        const response = await fetch('/api/sales', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(ventaData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Mostrar modal de éxito
            document.getElementById('factura-number').textContent = result.invoice_number;
            document.getElementById('factura-total').textContent = `$${total.toFixed(2)}`;
            modal.classList.add('show');
            
            // Limpiar carrito
            cart = [];
            renderizarCarrito();
            actualizarTotales();
        } else {
            throw new Error(result.message);
        }
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al procesar la venta: ' + error.message);
    } finally {
        checkoutBtn.disabled = false;
        checkoutBtn.textContent = '✅ Process Sale';
    }
});

// Cancelar venta
cancelBtn.addEventListener('click', () => {
    if (cart.length === 0) return;
    
    if (confirm('¿Desea cancelar la venta actual?')) {
        cart = [];
        renderizarCarrito();
        actualizarTotales();
        barcodeInput.focus();
    }
});

// Nueva venta desde modal
nuevaVentaBtn.addEventListener('click', () => {
    modal.classList.remove('show');
    barcodeInput.focus();
});

// Cerrar modal al hacer clic fuera
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.remove('show');
        barcodeInput.focus();
    }
});

// Atajos de teclado
document.addEventListener('keydown', (e) => {
    // F1 - Nueva venta
    if (e.key === 'F1') {
        e.preventDefault();
        if (cart.length > 0 && confirm('¿Cancelar venta actual?')) {
            cart = [];
            renderizarCarrito();
            actualizarTotales();
        }
        barcodeInput.focus();
    }
    
    // F2 - Cancelar
    if (e.key === 'F2') {
        e.preventDefault();
        cancelBtn.click();
    }
    
    // F3 - Procesar
    if (e.key === 'F3') {
        e.preventDefault();
        if (!checkoutBtn.disabled) {
            checkoutBtn.click();
        }
    }
});

// Funciones de notificaciones
function mostrarError(mensaje) {
    // Puedes mejorar esto con una librería de notificaciones
    const barcodeInput = document.getElementById('barcode-input');
    barcodeInput.style.borderColor = 'red';
    setTimeout(() => {
        barcodeInput.style.borderColor = '';
    }, 1000);
    console.error(mensaje);
}

function mostrarExito(mensaje) {
    const barcodeInput = document.getElementById('barcode-input');
    barcodeInput.style.borderColor = 'green';
    setTimeout(() => {
        barcodeInput.style.borderColor = '';
    }, 500);
    console.log(mensaje);
}

// Focus automático en el input al cargar
window.addEventListener('load', () => {
    barcodeInput.focus();
});
