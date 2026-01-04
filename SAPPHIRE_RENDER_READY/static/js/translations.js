// translations.js - Sistema de traducciones bilingüe

const translations = {
    es: {
        // Navbar
        dashboard: 'Panel',
        pos: 'Punto de Venta',
        inventory: 'Inventario',
        reports: 'Reportes',
        users: 'Usuarios',
        logout: 'Salir',
        
        // Dashboard
        dailyIncome: 'Ingresos del Día',
        salesMade: 'Ventas Realizadas',
        subtotal: 'Subtotal',
        vatCollected: 'ITBIS Recaudado',
        todaySales: 'Ventas de Hoy',
        topProducts: 'Productos Más Vendidos',
        quickActions: 'Acciones Rápidas',
        newSale: 'Nueva Venta',
        addProduct: 'Agregar Producto',
        viewReports: 'Ver Reportes',
        
        // POS
        scanProduct: 'Escanear Producto',
        scanHint: 'El escáner escribirá automáticamente aquí',
        shoppingCart: 'Carrito de Compra',
        emptyCart: 'El carrito está vacío',
        scanToStart: 'Escanee un producto para comenzar',
        clear: 'Limpiar',
        paymentMethod: 'Método de Pago',
        cash: 'Efectivo',
        card: 'Tarjeta',
        transfer: 'Transferencia',
        cancelSale: 'Cancelar Venta',
        processSale: 'Procesar Venta',
        vat: 'ITBIS',
        total: 'TOTAL',
        
        // Inventory
        inventoryManagement: 'Gestión de Inventario',
        searchPlaceholder: 'Buscar por nombre, código de barras o categoría...',
        code: 'Código',
        product: 'Producto',
        category: 'Categoría',
        price: 'Precio',
        stock: 'Stock',
        actions: 'Acciones',
        edit: 'Editar',
        delete: 'Eliminar',
        
        // Reports
        reportsStats: 'Reportes y Estadísticas',
        totalDay: 'Total del Día',
        salesDay: 'Ventas del Día',
        avgTicket: 'Ticket Promedio',
        soldProducts: 'Productos Vendidos',
        printReport: 'Imprimir Reporte',
        
        // Users
        userManagement: 'Gestión de Usuarios',
        addUser: 'Agregar Usuario',
        username: 'Usuario',
        role: 'Rol',
        name: 'Nombre',
        email: 'Email',
        phone: 'Teléfono',
        status: 'Estado',
        active: 'Activo',
        inactive: 'Inactivo',
        administrator: 'Administrador',
        cashier: 'Cajero',
        
        // Common
        save: 'Guardar',
        cancel: 'Cancelar',
        confirm: 'Confirmar',
        loading: 'Cargando...',
        noData: 'No hay datos',
        success: 'Éxito',
        error: 'Error',
        warning: 'Advertencia',
        
        // Messages
        saleSuccess: 'Venta procesada exitosamente',
        productAdded: 'Producto agregado',
        productNotFound: 'Producto no encontrado',
        insufficientStock: 'Stock insuficiente',
        confirmCancel: '¿Desea cancelar la venta actual?',
        confirmDelete: '¿Está seguro de eliminar',
    },
    
    en: {
        // Navbar
        dashboard: 'Dashboard',
        pos: 'Point of Sale',
        inventory: 'Inventory',
        reports: 'Reports',
        users: 'Users',
        logout: 'Logout',
        
        // Dashboard
        dailyIncome: 'Daily Income',
        salesMade: 'Sales Made',
        subtotal: 'Subtotal',
        vatCollected: 'VAT Collected',
        todaySales: 'Today\'s Sales',
        topProducts: 'Top Selling Products',
        quickActions: 'Quick Actions',
        newSale: 'New Sale',
        addProduct: 'Add Product',
        viewReports: 'View Reports',
        
        // POS
        scanProduct: 'Scan Product',
        scanHint: 'Scanner will write here automatically',
        shoppingCart: 'Shopping Cart',
        emptyCart: 'Cart is empty',
        scanToStart: 'Scan a product to begin',
        clear: 'Clear',
        paymentMethod: 'Payment Method',
        cash: 'Cash',
        card: 'Card',
        transfer: 'Transfer',
        cancelSale: 'Cancel Sale',
        processSale: 'Process Sale',
        vat: 'VAT',
        total: 'TOTAL',
        
        // Inventory
        inventoryManagement: 'Inventory Management',
        searchPlaceholder: 'Search by name, barcode or category...',
        code: 'Code',
        product: 'Product',
        category: 'Category',
        price: 'Price',
        stock: 'Stock',
        actions: 'Actions',
        edit: 'Edit',
        delete: 'Delete',
        
        // Reports
        reportsStats: 'Reports & Statistics',
        totalDay: 'Total Today',
        salesDay: 'Today\'s Sales',
        avgTicket: 'Average Ticket',
        soldProducts: 'Products Sold',
        printReport: 'Print Report',
        
        // Users
        userManagement: 'User Management',
        addUser: 'Add User',
        username: 'Username',
        role: 'Role',
        name: 'Name',
        email: 'Email',
        phone: 'Phone',
        status: 'Status',
        active: 'Active',
        inactive: 'Inactive',
        administrator: 'Administrator',
        cashier: 'Cashier',
        
        // Common
        save: 'Save',
        cancel: 'Cancel',
        confirm: 'Confirm',
        loading: 'Loading...',
        noData: 'No data',
        success: 'Success',
        error: 'Error',
        warning: 'Warning',
        
        // Messages
        saleSuccess: 'Sale processed successfully',
        productAdded: 'Product added',
        productNotFound: 'Product not found',
        insufficientStock: 'Insufficient stock',
        confirmCancel: 'Do you want to cancel the current sale?',
        confirmDelete: 'Are you sure you want to delete',
    }
};

// Obtener idioma guardado o detectar del navegador
function getCurrentLanguage() {
    const saved = localStorage.getItem('language');
    if (saved) return saved;
    
    const browserLang = navigator.language || navigator.userLanguage;
    return browserLang.startsWith('es') ? 'es' : 'en';
}

// Guardar idioma
function setLanguage(lang) {
    localStorage.setItem('language', lang);
    location.reload();
}

// Obtener traducción
function t(key) {
    const lang = getCurrentLanguage();
    return translations[lang][key] || key;
}

// Obtener tema guardado
function getCurrentTheme() {
    return localStorage.getItem('theme') || 'light';
}

// Cambiar tema
function toggleTheme() {
    const current = getCurrentTheme();
    const newTheme = current === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
}

// Aplicar tema al cargar
function applyTheme() {
    const theme = getCurrentTheme();
    document.documentElement.setAttribute('data-theme', theme);
}

// Inicializar al cargar página
document.addEventListener('DOMContentLoaded', () => {
    applyTheme();
});
