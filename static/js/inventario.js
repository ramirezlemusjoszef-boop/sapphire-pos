// Elementos del DOM
const addProductBtn = document.getElementById('add-product-btn');
const modal = document.getElementById('product-modal');
const closeBtn = modal.querySelector('.close');
const cancelModalBtn = document.getElementById('cancel-modal');
const productForm = document.getElementById('product-form');
const searchInput = document.getElementById('search-input');
const productsTable = document.getElementById('products-table');
const modalTitle = document.getElementById('modal-title');

let productos = [];
let modoEdicion = false;

// Cargar productos
async function cargarProductos() {
    try {
        const response = await fetch('/api/products');
        productos = await response.json();
        renderizarProductos(productos);
    } catch (error) {
        console.error('Error loading products:', error);
        productsTable.innerHTML = '<tr><td colspan="6" class="text-center">Error loading products</td></tr>';
    }
}

// Renderizar tabla de productos
function renderizarProductos(items) {
    if (items.length === 0) {
        productsTable.innerHTML = '<tr><td colspan="6" class="text-center">No hay productos registrados</td></tr>';
        return;
    }
    
    productsTable.innerHTML = items.map(p => {
        const stockClass = p.cantidad_stock < 10 ? 'text-danger' : '';
        
        return `
            <tr>
                <td>${p.codigo_barra}</td>
                <td>
                    <strong>${p.nombre}</strong>
                    ${p.descripcion ? `<br><small>${p.descripcion}</small>` : ''}
                </td>
                <td>${p.categoria || 'General'}</td>
                <td><strong>$${p.precio.toFixed(2)}</strong></td>
                <td class="${stockClass}">
                    <strong>${p.cantidad_stock}</strong>
                    ${p.cantidad_stock < 10 ? ' ⚠️' : ''}
                </td>
                <td>
                    <button class="btn btn-primary btn-sm" onclick="editarProducto(${p.id})">
                        ✏️ Editar
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="eliminarProducto(${p.id}, '${p.nombre}')">
                        🗑️
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Buscar productos
searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    
    if (!query) {
        renderizarProductos(productos);
        return;
    }
    
    const filtrados = productos.filter(p => 
        p.nombre.toLowerCase().includes(query) ||
        p.codigo_barra.toLowerCase().includes(query) ||
        (p.categoria && p.categoria.toLowerCase().includes(query)) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(query))
    );
    
    renderizarProductos(filtrados);
});

// Abrir modal para agregar
addProductBtn.addEventListener('click', () => {
    modoEdicion = false;
    modalTitle.textContent = 'Agregar Producto';
    productForm.reset();
    document.getElementById('product-id').value = '';
    modal.style.display = 'flex';
    document.getElementById('codigo_barra').focus();
});

// Editar producto
async function editarProducto(id) {
    const producto = productos.find(p => p.id === id);
    if (!producto) return;
    
    modoEdicion = true;
    modalTitle.textContent = 'Editar Producto';
    
    document.getElementById('product-id').value = producto.id;
    document.getElementById('codigo_barra').value = producto.codigo_barra;
    document.getElementById('nombre').value = producto.nombre;
    document.getElementById('descripcion').value = producto.descripcion || '';
    document.getElementById('precio').value = producto.precio;
    document.getElementById('costo').value = producto.costo || '';
    document.getElementById('cantidad_stock').value = producto.cantidad_stock;
    document.getElementById('categoria').value = producto.categoria || 'General';
    
    // Deshabilitar código de barras en edición
    document.getElementById('codigo_barra').disabled = true;
    
    modal.style.display = 'flex';
}

// Eliminar producto
async function eliminarProducto(id, nombre) {
    if (!confirm(`Are you sure you want to delete "${nombre}"?`)) return;
    
    try {
        const response = await fetch(`/api/products/${id}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('Product deleted successfully');
            cargarProductos();
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error deleting product');
    }
}

// Guardar producto (crear o actualizar)
productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const productoId = document.getElementById('product-id').value;
    const data = {
        codigo_barra: document.getElementById('codigo_barra').value.trim(),
        nombre: document.getElementById('nombre').value.trim(),
        descripcion: document.getElementById('descripcion').value.trim(),
        precio: parseFloat(document.getElementById('precio').value),
        costo: parseFloat(document.getElementById('costo').value) || 0,
        cantidad_stock: parseInt(document.getElementById('cantidad_stock').value),
        categoria: document.getElementById('categoria').value
    };
    
    // Validaciones
    if (!data.codigo_barra || !data.nombre || isNaN(data.precio) || data.cantidad_stock < 0) {
        alert('Please complete all required fields correctly');
        return;
    }
    
    try {
        let response;
        
        if (modoEdicion && productoId) {
            // Actualizar
            response = await fetch(`/api/products/${productoId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
        } else {
            // Crear nuevo
            response = await fetch('/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
        }
        
        const result = await response.json();
        
        if (result.success) {
            alert(modoEdicion ? 'Product updated' : 'Product added successfully');
            cerrarModal();
            cargarProductos();
        } else {
            alert('Error: ' + result.message);
        }
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error saving product: ' + error.message);
    }
});

// Cerrar modal
function cerrarModal() {
    modal.style.display = 'none';
    productForm.reset();
    document.getElementById('codigo_barra').disabled = false;
}

closeBtn.addEventListener('click', cerrarModal);
cancelModalBtn.addEventListener('click', cerrarModal);

modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        cerrarModal();
    }
});

// Cargar productos al iniciar
cargarProductos();
