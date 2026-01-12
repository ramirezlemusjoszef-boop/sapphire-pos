from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime
import secrets
import os
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', secrets.token_hex(16))
CORS(app)

def get_db():
    DATABASE_URL = os.environ.get('DATABASE_URL')
    if DATABASE_URL and DATABASE_URL.startswith('postgres://'):
        DATABASE_URL = DATABASE_URL.replace('postgres://', 'postgresql://', 1)
    conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''CREATE TABLE IF NOT EXISTS usuarios (id SERIAL PRIMARY KEY, username VARCHAR(100) UNIQUE NOT NULL, password VARCHAR(255) NOT NULL, rol VARCHAR(50) NOT NULL, nombre VARCHAR(100) NOT NULL, activo INTEGER DEFAULT 1)''')
    cursor.execute('''CREATE TABLE IF NOT EXISTS productos (id SERIAL PRIMARY KEY, codigo_barra VARCHAR(100) UNIQUE NOT NULL, nombre VARCHAR(200) NOT NULL, descripcion TEXT, precio DECIMAL(10,2) NOT NULL, costo DECIMAL(10,2), cantidad_stock INTEGER DEFAULT 0, categoria VARCHAR(100))''')
    cursor.execute('''CREATE TABLE IF NOT EXISTS ventas (id SERIAL PRIMARY KEY, numero_factura VARCHAR(100) UNIQUE NOT NULL, usuario_id INTEGER NOT NULL, subtotal DECIMAL(10,2) NOT NULL, vat DECIMAL(10,2) NOT NULL, total DECIMAL(10,2) NOT NULL, metodo_pago VARCHAR(50) NOT NULL, fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP)''')
    cursor.execute('''CREATE TABLE IF NOT EXISTS detalle_ventas (id SERIAL PRIMARY KEY, venta_id INTEGER NOT NULL, producto_id INTEGER NOT NULL, cantidad INTEGER NOT NULL, precio_unitario DECIMAL(10,2) NOT NULL, subtotal DECIMAL(10,2) NOT NULL)''')
    cursor.execute('''CREATE TABLE IF NOT EXISTS configuracion (id SERIAL PRIMARY KEY, clave VARCHAR(100) UNIQUE NOT NULL, valor VARCHAR(255) NOT NULL)''')
    cursor.execute("SELECT * FROM usuarios WHERE username = 'admin'")
    if not cursor.fetchone():
        cursor.execute("INSERT INTO usuarios (username, password, rol, nombre) VALUES (%s, %s, %s, %s)", ('admin', generate_password_hash('admin123'), 'admin', 'Administrator'))
    cursor.execute("SELECT * FROM usuarios WHERE username = 'cashier'")
    if not cursor.fetchone():
        cursor.execute("INSERT INTO usuarios (username, password, rol, nombre) VALUES (%s, %s, %s, %s)", ('cashier', generate_password_hash('cashier123'), 'cashier', 'Cashier'))
    cursor.execute("SELECT * FROM configuracion WHERE clave = 'vat_enabled'")
    if not cursor.fetchone():
        cursor.execute("INSERT INTO configuracion (clave, valor) VALUES (%s, %s)", ('vat_enabled', 'true'))
    conn.commit()
    conn.close()

@app.route('/')
def index():
    if 'user_id' in session: return redirect(url_for('dashboard'))
    return render_template('login.html')

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM usuarios WHERE username = %s AND activo = 1", (data['username'],))
    user = cursor.fetchone()
    conn.close()
    if user and check_password_hash(user['password'], data['password']):
        session['user_id'] = user['id']
        session['username'] = user['username']
        session['rol'] = user['rol']
        session['nombre'] = user['nombre']
        return jsonify({'success': True})
    return jsonify({'success': False}), 401

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))

@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session: return redirect(url_for('index'))
    return render_template('dashboard.html')

@app.route('/pos')
def pos():
    if 'user_id' not in session: return redirect(url_for('index'))
    return render_template('pos.html')

@app.route('/inventario')
def inventario():
    if 'user_id' not in session or session.get('rol') != 'admin': return redirect(url_for('dashboard'))
    return render_template('inventario.html')

@app.route('/reportes')
def reportes():
    if 'user_id' not in session: return redirect(url_for('index'))
    return render_template('reportes.html')

@app.route('/usuarios')
def usuarios():
    if 'user_id' not in session or session.get('rol') != 'admin': return redirect(url_for('dashboard'))
    return render_template('usuarios.html')

@app.route('/settings')
def settings():
    if 'user_id' not in session or session.get('rol') != 'admin': return redirect(url_for('dashboard'))
    return render_template('settings.html')

@app.route('/api/config/vat', methods=['GET'])
def get_vat_config():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT valor FROM configuracion WHERE clave = 'vat_enabled'")
    result = cursor.fetchone()
    conn.close()
    return jsonify({'vat_enabled': result['valor'] == 'true' if result else True})

@app.route('/api/config/vat', methods=['POST'])
def set_vat_config():
    if session.get('rol') != 'admin': return jsonify({'error': 'Unauthorized'}), 403
    data = request.get_json()
    conn = get_db()
    cursor = conn.cursor()
    valor = 'true' if data.get('vat_enabled') else 'false'
    cursor.execute("UPDATE configuracion SET valor = %s WHERE clave = 'vat_enabled'", (valor,))
    if cursor.rowcount == 0:
        cursor.execute("INSERT INTO configuracion (clave, valor) VALUES ('vat_enabled', %s)", (valor,))
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'vat_enabled': data.get('vat_enabled')})

@app.route('/api/products', methods=['GET'])
def get_products():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM productos ORDER BY nombre")
    products = cursor.fetchall()
    conn.close()
    for p in products:
        p['precio'] = float(p['precio']) if p['precio'] else 0
        p['costo'] = float(p['costo']) if p['costo'] else 0
    return jsonify(products)

@app.route('/api/products/<codigo>', methods=['GET'])
def get_product(codigo):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM productos WHERE codigo_barra = %s", (codigo,))
    product = cursor.fetchone()
    conn.close()
    if product:
        product['precio'] = float(product['precio']) if product['precio'] else 0
        product['costo'] = float(product['costo']) if product['costo'] else 0
        return jsonify(product)
    return jsonify({'error': 'Not found'}), 404

@app.route('/api/products', methods=['POST'])
def add_product():
    if session.get('rol') != 'admin': return jsonify({'error': 'Unauthorized'}), 403
    data = request.get_json()
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('INSERT INTO productos (codigo_barra, nombre, descripcion, precio, costo, cantidad_stock, categoria) VALUES (%s, %s, %s, %s, %s, %s, %s)',
            (data['codigo_barra'], data['nombre'], data.get('descripcion', ''), float(data['precio']), float(data.get('costo', 0)), int(data.get('cantidad_stock', 0)), data.get('categoria', 'General')))
        conn.commit()
        conn.close()
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 400

@app.route('/api/products/<int:id>', methods=['PUT'])
def update_product(id):
    if session.get('rol') != 'admin': return jsonify({'error': 'Unauthorized'}), 403
    data = request.get_json()
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('UPDATE productos SET nombre=%s, descripcion=%s, precio=%s, costo=%s, cantidad_stock=%s, categoria=%s WHERE id=%s',
            (data['nombre'], data.get('descripcion', ''), float(data['precio']), float(data.get('costo', 0)), int(data['cantidad_stock']), data.get('categoria', 'General'), id))
        conn.commit()
        conn.close()
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/products/<int:id>', methods=['DELETE'])
def delete_product(id):
    if session.get('rol') != 'admin': return jsonify({'error': 'Unauthorized'}), 403
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM productos WHERE id = %s", (id,))
        conn.commit()
        conn.close()
        return jsonify({'success': True})
    except:
        return jsonify({'success': False}), 500

@app.route('/api/sales', methods=['POST'])
def process_sale():
    data = request.get_json()
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT valor FROM configuracion WHERE clave = 'vat_enabled'")
        result = cursor.fetchone()
        vat_enabled = result['valor'] == 'true' if result else True
        subtotal = float(data['subtotal'])
        vat = subtotal * 0.10 if vat_enabled else 0
        total = subtotal + vat
        numero_factura = f"INV-{datetime.now().strftime('%Y%m%d%H%M%S')}"
        cursor.execute('INSERT INTO ventas (numero_factura, usuario_id, subtotal, vat, total, metodo_pago) VALUES (%s, %s, %s, %s, %s, %s) RETURNING id',
            (numero_factura, session['user_id'], subtotal, vat, total, data['payment_method']))
        venta_id = cursor.fetchone()['id']
        for item in data['items']:
            cursor.execute('INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, subtotal) VALUES (%s, %s, %s, %s, %s)',
                (venta_id, item['id'], item['cantidad'], item['precio'], item['subtotal']))
            cursor.execute("UPDATE productos SET cantidad_stock = cantidad_stock - %s WHERE id = %s", (item['cantidad'], item['id']))
        conn.commit()
        conn.close()
        return jsonify({'success': True, 'invoice_number': numero_factura, 'vat': vat, 'total': total, 'vat_enabled': vat_enabled})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/sales/today', methods=['GET'])
def sales_today():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT v.*, u.nombre as cashier FROM ventas v JOIN usuarios u ON v.usuario_id = u.id WHERE DATE(v.fecha) = CURRENT_DATE ORDER BY v.fecha DESC')
    sales = cursor.fetchall()
    conn.close()
    for s in sales:
        s['subtotal'] = float(s['subtotal'])
        s['vat'] = float(s['vat'])
        s['total'] = float(s['total'])
    return jsonify(sales)

@app.route('/api/ventas/hoy', methods=['GET'])
def ventas_hoy():
    return sales_today()

@app.route('/api/stats/today', methods=['GET'])
def stats_today():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT COUNT(*) as total_sales, COALESCE(SUM(total), 0) as total_income, COALESCE(SUM(subtotal), 0) as subtotal, COALESCE(SUM(vat), 0) as total_vat FROM ventas WHERE DATE(fecha) = CURRENT_DATE')
    stats = cursor.fetchone()
    stats['total_sales'] = int(stats['total_sales'])
    stats['total_income'] = float(stats['total_income'])
    stats['subtotal'] = float(stats['subtotal'])
    stats['total_vat'] = float(stats['total_vat'])
    cursor.execute('SELECT p.nombre, SUM(dv.cantidad) as quantity_sold FROM detalle_ventas dv JOIN ventas v ON dv.venta_id = v.id JOIN productos p ON dv.producto_id = p.id WHERE DATE(v.fecha) = CURRENT_DATE GROUP BY p.id, p.nombre ORDER BY quantity_sold DESC LIMIT 10')
    stats['top_products'] = [{'nombre': p['nombre'], 'quantity_sold': int(p['quantity_sold'])} for p in cursor.fetchall()]
    conn.close()
    return jsonify(stats)

@app.route('/api/estadisticas/hoy', methods=['GET'])
def estadisticas_hoy():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT COUNT(*) as total_ventas, COALESCE(SUM(total), 0) as total_ingresos FROM ventas WHERE DATE(fecha) = CURRENT_DATE')
    stats = cursor.fetchone()
    cursor.execute('SELECT p.nombre, SUM(dv.cantidad) as cantidad_vendida FROM detalle_ventas dv JOIN ventas v ON dv.venta_id = v.id JOIN productos p ON dv.producto_id = p.id WHERE DATE(v.fecha) = CURRENT_DATE GROUP BY p.id, p.nombre ORDER BY cantidad_vendida DESC LIMIT 10')
    productos_top = cursor.fetchall()
    conn.close()
    return jsonify({'total_ventas': int(stats['total_ventas']), 'total_ingresos': float(stats['total_ingresos']), 'productos_top': [{'nombre': p['nombre'], 'cantidad_vendida': int(p['cantidad_vendida'])} for p in productos_top]})

@app.route('/api/users', methods=['GET'])
def get_users():
    if session.get('rol') != 'admin': return jsonify({'error': 'Unauthorized'}), 403
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, username, rol, nombre, activo FROM usuarios")
    users = cursor.fetchall()
    conn.close()
    return jsonify(users)

@app.route('/api/users', methods=['POST'])
def add_user():
    if session.get('rol') != 'admin': return jsonify({'error': 'Unauthorized'}), 403
    data = request.get_json()
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO usuarios (username, password, rol, nombre) VALUES (%s, %s, %s, %s)", (data['username'], generate_password_hash(data['password']), data['rol'], data['nombre']))
        conn.commit()
        conn.close()
        return jsonify({'success': True})
    except:
        return jsonify({'success': False}), 400

@app.route('/api/users/<int:id>', methods=['PUT'])
def update_user(id):
    if session.get('rol') != 'admin': return jsonify({'error': 'Unauthorized'}), 403
    data = request.get_json()
    try:
        conn = get_db()
        cursor = conn.cursor()
        if data.get('password'):
            cursor.execute("UPDATE usuarios SET nombre=%s, rol=%s, password=%s WHERE id=%s", (data['nombre'], data['rol'], generate_password_hash(data['password']), id))
        else:
            cursor.execute("UPDATE usuarios SET nombre=%s, rol=%s WHERE id=%s", (data['nombre'], data['rol'], id))
        conn.commit()
        conn.close()
        return jsonify({'success': True})
    except:
        return jsonify({'success': False}), 500

@app.route('/api/users/<int:id>/toggle', methods=['POST'])
def toggle_user(id):
    if session.get('rol') != 'admin': return jsonify({'error': 'Unauthorized'}), 403
    if id == session.get('user_id'): return jsonify({'success': False}), 400
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT activo FROM usuarios WHERE id = %s", (id,))
        user = cursor.fetchone()
        new_status = 0 if user['activo'] else 1
        cursor.execute("UPDATE usuarios SET activo = %s WHERE id = %s", (new_status, id))
        conn.commit()
        conn.close()
        return jsonify({'success': True, 'activo': new_status})
    except:
        return jsonify({'success': False}), 500

with app.app_context():
    try:
        init_db()
    except Exception as e:
        print(f"DB Error: {e}")

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)
