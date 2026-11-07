"""SAPPHIRE POS — point of sale for a boutique (glasses, costume jewelry, dresses, shirts,
jewelry, shoes, bags).

Two roles:
  admin   -> products, stock, labels, monthly dashboard and trends, all sales, users, settings
  cashier -> scan & charge, print receipt, today's sales only

Runs on PostgreSQL (DATABASE_URL) in production, SQLite locally.
"""
import csv
import io
import os
import secrets
import uuid
from datetime import datetime, timedelta, timezone
from decimal import Decimal, ROUND_HALF_UP
from functools import wraps
from zoneinfo import ZoneInfo

from flask import (Flask, Response, jsonify, redirect, render_template, request, session,
                   url_for)
from werkzeug.middleware.proxy_fix import ProxyFix
from werkzeug.security import check_password_hash, generate_password_hash

import db

APP_VERSION = "2.0.0"
STORE_TZ = ZoneInfo(os.environ.get("STORE_TZ", "America/Nassau"))
DEFAULT_CATEGORIES = ["Glasses", "Costume jewelry", "Jewelry", "Dresses", "Shirts", "Shoes",
                      "Bags", "Accessories", "Other"]

app = Flask(__name__)
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1)
# In production SECRET_KEY must be set (render.yaml generates one); without it a random key is
# used, which is safe but logs everyone out on each restart.
app.secret_key = os.environ.get("SECRET_KEY") or (secrets.token_hex(32) if db.IS_PG else "local-dev-key")
app.config.update(
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="Lax",
    SESSION_COOKIE_SECURE=bool(os.environ.get("RENDER") or os.environ.get("SECURE_COOKIES")),
    PERMANENT_SESSION_LIFETIME=timedelta(hours=14),
    MAX_CONTENT_LENGTH=5 * 1024 * 1024,
    JSON_SORT_KEYS=False,
)
if not os.environ.get("SECRET_KEY") and db.IS_PG:
    print("WARNING: SECRET_KEY is not set. Set it in Render > Environment.")

CENT = Decimal("0.01")


def money(x):
    return Decimal(str(x or 0)).quantize(CENT, rounding=ROUND_HALF_UP)


def f(x):
    """Decimal/None -> float for JSON."""
    return float(x) if x is not None else 0.0


def utcnow():
    return datetime.now(timezone.utc).replace(tzinfo=None)


def to_local(dt):
    if dt is None:
        return None
    if isinstance(dt, str):
        dt = datetime.fromisoformat(dt)
    return dt.replace(tzinfo=timezone.utc).astimezone(STORE_TZ)


def iso_local(dt):
    d = to_local(dt)
    return d.isoformat() if d else None


def local_day_range(day):
    """day: date in store time -> (utc_start, utc_end) naive."""
    start = datetime(day.year, day.month, day.day, tzinfo=STORE_TZ)
    end = start + timedelta(days=1)
    return (start.astimezone(timezone.utc).replace(tzinfo=None),
            end.astimezone(timezone.utc).replace(tzinfo=None))


def local_range(d_from, d_to):
    """Inclusive local dates -> utc naive [start, end)."""
    return local_day_range(d_from)[0], local_day_range(d_to)[1]


def today_local():
    return datetime.now(STORE_TZ).date()


# --------------------------------------------------------------------------- schema

def init_db():
    pk = "SERIAL PRIMARY KEY" if db.IS_PG else "INTEGER PRIMARY KEY AUTOINCREMENT"
    with db.connect() as c:
        c.execute(f"""CREATE TABLE IF NOT EXISTS usuarios (
            id {pk}, username VARCHAR(100) UNIQUE NOT NULL, password VARCHAR(255) NOT NULL,
            rol VARCHAR(50) NOT NULL, nombre VARCHAR(100) NOT NULL, activo INTEGER DEFAULT 1)""")
        c.execute(f"""CREATE TABLE IF NOT EXISTS productos (
            id {pk}, codigo_barra VARCHAR(100) UNIQUE NOT NULL, nombre VARCHAR(200) NOT NULL,
            descripcion TEXT, precio DECIMAL(10,2) NOT NULL, costo DECIMAL(10,2),
            cantidad_stock INTEGER DEFAULT 0, categoria VARCHAR(100))""")
        c.execute(f"""CREATE TABLE IF NOT EXISTS ventas (
            id {pk}, numero_factura VARCHAR(100) UNIQUE NOT NULL, usuario_id INTEGER NOT NULL,
            subtotal DECIMAL(10,2) NOT NULL, vat DECIMAL(10,2) NOT NULL, total DECIMAL(10,2) NOT NULL,
            metodo_pago VARCHAR(50) NOT NULL, fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP)""")
        c.execute(f"""CREATE TABLE IF NOT EXISTS detalle_ventas (
            id {pk}, venta_id INTEGER NOT NULL, producto_id INTEGER NOT NULL,
            cantidad INTEGER NOT NULL, precio_unitario DECIMAL(10,2) NOT NULL,
            subtotal DECIMAL(10,2) NOT NULL)""")
        c.execute(f"""CREATE TABLE IF NOT EXISTS configuracion (
            id {pk}, clave VARCHAR(100) UNIQUE NOT NULL, valor TEXT NOT NULL)""")
        c.execute(f"""CREATE TABLE IF NOT EXISTS movimientos_stock (
            id {pk}, producto_id INTEGER NOT NULL, cambio INTEGER NOT NULL,
            stock_final INTEGER, motivo VARCHAR(200), usuario_id INTEGER,
            fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP)""")

        # v2 columns (safe on databases created by the old version)
        db.add_column(c, "usuarios", "must_change", "INTEGER DEFAULT 0")
        db.add_column(c, "productos", "stock_minimo", "INTEGER DEFAULT 2")
        db.add_column(c, "productos", "activo", "INTEGER DEFAULT 1")
        db.add_column(c, "productos", "talla", "VARCHAR(50)")
        db.add_column(c, "productos", "color", "VARCHAR(50)")
        db.add_column(c, "productos", "creado", "TIMESTAMP")
        db.add_column(c, "ventas", "descuento", "DECIMAL(10,2) DEFAULT 0")
        db.add_column(c, "ventas", "efectivo", "DECIMAL(10,2)")
        db.add_column(c, "ventas", "cambio", "DECIMAL(10,2)")
        db.add_column(c, "ventas", "anulada", "INTEGER DEFAULT 0")
        db.add_column(c, "ventas", "anulada_fecha", "TIMESTAMP")
        db.add_column(c, "ventas", "anulada_por", "INTEGER")
        db.add_column(c, "ventas", "motivo_anulacion", "VARCHAR(200)")
        db.add_column(c, "detalle_ventas", "nombre", "VARCHAR(200)")
        db.add_column(c, "detalle_ventas", "codigo", "VARCHAR(100)")
        db.add_column(c, "detalle_ventas", "categoria", "VARCHAR(100)")
        db.add_column(c, "detalle_ventas", "costo_unitario", "DECIMAL(10,2)")
        if db.IS_PG:
            c.execute("ALTER TABLE configuracion ALTER COLUMN valor TYPE TEXT")
        for idx in ("CREATE INDEX IF NOT EXISTS ix_ventas_fecha ON ventas (fecha)",
                    "CREATE INDEX IF NOT EXISTS ix_det_venta ON detalle_ventas (venta_id)",
                    "CREATE INDEX IF NOT EXISTS ix_mov_prod ON movimientos_stock (producto_id)"):
            c.execute(idx)

        if not c.one("SELECT id FROM usuarios WHERE rol = 'admin'"):
            c.insert("INSERT INTO usuarios (username, password, rol, nombre, must_change) "
                     "VALUES (%s, %s, 'admin', 'Administrator', 1)",
                     ("admin", generate_password_hash(os.environ.get("ADMIN_PASSWORD", "admin123"))))
        if not c.one("SELECT id FROM usuarios WHERE rol = 'cashier'"):
            c.insert("INSERT INTO usuarios (username, password, rol, nombre, must_change) "
                     "VALUES (%s, %s, 'cashier', 'Cashier', 1)",
                     ("cashier", generate_password_hash("cashier123")))
        for k, v in DEFAULT_SETTINGS.items():
            if not c.one("SELECT id FROM configuracion WHERE clave = %s", (k,)):
                c.insert("INSERT INTO configuracion (clave, valor) VALUES (%s, %s)", (k, str(v)))


DEFAULT_SETTINGS = {
    "store_name": "SAPPHIRE",
    "store_tagline": "Fashion · Jewelry · Accessories",
    "store_address": "Nassau, The Bahamas",
    "store_phone": "",
    "receipt_footer": "Thank you for shopping with us!",
    "return_policy": "Exchanges within 7 days with receipt.",
    "vat_enabled": "true",
    "vat_rate": "10",
    "prices_include_vat": "false",
    "paper_width": "80",
    "auto_print": "true",
    "allow_negative_stock": "false",
    "currency": "$",
    "categories": ",".join(DEFAULT_CATEGORIES),
    "label_size": "50x25",
}
BOOL_SETTINGS = {"vat_enabled", "prices_include_vat", "auto_print", "allow_negative_stock"}


def get_settings(c):
    rows = c.all("SELECT clave, valor FROM configuracion")
    s = dict(DEFAULT_SETTINGS)
    s.update({r["clave"]: r["valor"] for r in rows})
    out = {}
    for k, v in s.items():
        if k in BOOL_SETTINGS:
            out[k] = str(v).lower() == "true"
        elif k == "vat_rate":
            try:
                out[k] = float(v)
            except ValueError:
                out[k] = 10.0
        elif k == "categories":
            out[k] = [x.strip() for x in str(v).split(",") if x.strip()]
        else:
            out[k] = v
    return out


# --------------------------------------------------------------------------- auth

def current_user():
    return session.get("user")


def login_required(fn):
    @wraps(fn)
    def wrapper(*a, **kw):
        if not current_user():
            if request.path.startswith("/api/"):
                return jsonify(error="not_logged_in"), 401
            return redirect(url_for("index"))
        return fn(*a, **kw)
    return wrapper


def admin_required(fn):
    @wraps(fn)
    @login_required
    def wrapper(*a, **kw):
        if current_user()["rol"] != "admin":
            if request.path.startswith("/api/"):
                return jsonify(error="forbidden"), 403
            return redirect(url_for("pos_page"))
        return fn(*a, **kw)
    return wrapper


def err(msg, code=400, **extra):
    return jsonify(error=msg, **extra), code


@app.after_request
def no_cache_api(resp):
    if request.path.startswith("/api/"):
        resp.headers["Cache-Control"] = "no-store"
    return resp


# --------------------------------------------------------------------------- pages

@app.route("/")
def index():
    u = current_user()
    if u:
        return redirect(url_for("admin_page" if u["rol"] == "admin" else "pos_page"))
    return render_template("login.html", version=APP_VERSION)


@app.route("/pos")
@login_required
def pos_page():
    return render_template("pos.html", user=current_user(), version=APP_VERSION)


@app.route("/admin")
@admin_required
def admin_page():
    return render_template("admin.html", user=current_user(), version=APP_VERSION)


@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("index"))


@app.route("/favicon.ico")
def favicon():
    return redirect(url_for("static", filename="favicon.svg"))


@app.route("/healthz")
def healthz():
    return "ok"


# --------------------------------------------------------------------------- auth API

@app.post("/api/login")
def api_login():
    data = request.get_json(silent=True) or {}
    username = str(data.get("username", "")).strip().lower()
    password = str(data.get("password", ""))
    with db.connect() as c:
        u = c.one("SELECT * FROM usuarios WHERE LOWER(username) = %s AND activo = 1", (username,))
    if not u or not check_password_hash(u["password"], password):
        return err("bad_credentials", 401)
    must_change = bool(u.get("must_change")) or password in ("admin123", "cashier123")
    session.clear()
    session.permanent = True
    session["user"] = {"id": u["id"], "username": u["username"], "rol": u["rol"],
                       "nombre": u["nombre"], "must_change": must_change}
    return jsonify(ok=True, rol=u["rol"], must_change=must_change)


@app.get("/api/me")
@login_required
def api_me():
    return jsonify(current_user())


@app.post("/api/me/password")
@login_required
def api_change_password():
    data = request.get_json(silent=True) or {}
    new = str(data.get("new", ""))
    if len(new) < 6:
        return err("password_too_short")
    if new in ("admin123", "cashier123"):
        return err("password_too_weak")
    u = current_user()
    with db.connect() as c:
        row = c.one("SELECT password FROM usuarios WHERE id = %s", (u["id"],))
        if not row or not check_password_hash(row["password"], str(data.get("current", ""))):
            return err("wrong_current_password", 403)
        c.execute("UPDATE usuarios SET password = %s, must_change = 0 WHERE id = %s",
                  (generate_password_hash(new), u["id"]))
    u["must_change"] = False
    session["user"] = u
    return jsonify(ok=True)


# --------------------------------------------------------------------------- settings

@app.get("/api/settings")
@login_required
def api_settings():
    with db.connect() as c:
        return jsonify(get_settings(c))


@app.put("/api/settings")
@admin_required
def api_settings_save():
    data = request.get_json(silent=True) or {}
    with db.connect() as c:
        for k in DEFAULT_SETTINGS:
            if k not in data:
                continue
            v = data[k]
            if k in BOOL_SETTINGS:
                v = "true" if v in (True, "true", "1", 1, "on") else "false"
            elif k == "categories":
                v = ",".join(x.strip() for x in (v if isinstance(v, list) else str(v).split(","))
                             if str(x).strip())
            elif k == "vat_rate":
                try:
                    v = str(max(0.0, min(50.0, float(v))))
                except ValueError:
                    return err("bad_vat_rate")
            elif k == "paper_width":
                v = "58" if str(v) == "58" else "80"
            v = str(v)[:2000]
            if c.one("SELECT id FROM configuracion WHERE clave = %s", (k,)):
                c.execute("UPDATE configuracion SET valor = %s WHERE clave = %s", (v, k))
            else:
                c.insert("INSERT INTO configuracion (clave, valor) VALUES (%s, %s)", (k, v))
        return jsonify(get_settings(c))


# --------------------------------------------------------------------------- products

def product_out(p, sold=None):
    return {
        "id": p["id"], "barcode": p["codigo_barra"], "name": p["nombre"],
        "description": p.get("descripcion") or "", "price": f(p["precio"]),
        "cost": f(p.get("costo")), "stock": int(p.get("cantidad_stock") or 0),
        "min_stock": int(p["stock_minimo"]) if p.get("stock_minimo") is not None else 2,
        "category": p.get("categoria") or "Other", "size": p.get("talla") or "",
        "color": p.get("color") or "", "active": bool(p.get("activo", 1)),
        **({"sold_30d": sold} if sold is not None else {}),
    }


def ean13_check(d12):
    s = sum(int(ch) * (3 if i % 2 else 1) for i, ch in enumerate(d12))
    return str((10 - s % 10) % 10)


def next_internal_code(c):
    """In-store EAN-13 codes in the 200-prefix range (reserved for internal use)."""
    n = (c.scalar("SELECT MAX(id) FROM productos") or 0) + 1
    while True:
        d12 = "200" + str(n).zfill(9)
        code = d12 + ean13_check(d12)
        if not c.one("SELECT id FROM productos WHERE codigo_barra = %s", (code,)):
            return code
        n += 1


def log_stock(c, product_id, delta, final, reason, user_id):
    c.insert("INSERT INTO movimientos_stock (producto_id, cambio, stock_final, motivo, usuario_id, fecha) "
             "VALUES (%s, %s, %s, %s, %s, %s)", (product_id, delta, final, reason[:200], user_id, utcnow()))


def clean_product(data, partial=False):
    out = {}
    def has(k):
        return k in data and data[k] is not None
    if has("name") or not partial:
        name = str(data.get("name", "")).strip()
        if not name:
            raise ValueError("name_required")
        out["nombre"] = name[:200]
    if has("price") or not partial:
        try:
            price = money(data.get("price"))
        except Exception:
            raise ValueError("bad_price")
        if price < 0:
            raise ValueError("bad_price")
        out["precio"] = price
    if has("cost"):
        try:
            out["costo"] = money(data.get("cost") or 0)
        except Exception:
            raise ValueError("bad_cost")
    for k, col, n in (("category", "categoria", 100), ("size", "talla", 50), ("color", "color", 50),
                      ("description", "descripcion", 2000)):
        if has(k):
            out[col] = str(data[k]).strip()[:n]
    if has("min_stock"):
        out["stock_minimo"] = max(0, int(data["min_stock"] or 0))
    if has("active"):
        out["activo"] = 1 if data["active"] else 0
    return out


@app.get("/api/products")
@login_required
def api_products():
    q = (request.args.get("q") or "").strip()
    cat = (request.args.get("category") or "").strip()
    only = request.args.get("filter") or ""
    is_admin = current_user()["rol"] == "admin"
    sql = "SELECT * FROM productos WHERE 1=1"
    params = []
    if not is_admin or request.args.get("active") == "1":
        sql += " AND COALESCE(activo, 1) = 1"
    if q:
        sql += " AND (nombre ILIKE %s OR codigo_barra ILIKE %s OR categoria ILIKE %s)"
        params += [f"%{q}%"] * 3
    if cat:
        sql += " AND categoria = %s"
        params.append(cat)
    if only == "low":
        sql += " AND cantidad_stock <= COALESCE(stock_minimo, 2)"
    sql += " ORDER BY nombre"
    limit = 60 if not is_admin else 5000
    with db.connect() as c:
        rows = c.all(sql, params)[:limit]
        sold = {}
        if is_admin:
            start = utcnow() - timedelta(days=30)
            for r in c.all("SELECT d.producto_id, SUM(d.cantidad) AS q FROM detalle_ventas d "
                           "JOIN ventas v ON v.id = d.venta_id WHERE v.fecha >= %s "
                           "AND COALESCE(v.anulada, 0) = 0 GROUP BY d.producto_id", (start,)):
                sold[r["producto_id"]] = int(r["q"] or 0)
    out = [product_out(p, sold.get(p["id"], 0) if is_admin else None) for p in rows]
    if not is_admin:
        for p in out:
            p.pop("cost", None)
    return jsonify(out)


@app.get("/api/products/barcode/<path:code>")
@login_required
def api_product_by_barcode(code):
    code = code.strip()
    with db.connect() as c:
        p = c.one("SELECT * FROM productos WHERE codigo_barra = %s", (code,))
        if not p and code.isdigit():
            # scanners sometimes drop/add a leading zero (UPC-A vs EAN-13)
            alt = code[1:] if code.startswith("0") else "0" + code
            p = c.one("SELECT * FROM productos WHERE codigo_barra = %s", (alt,))
    if not p or not p.get("activo", 1):
        return err("not_found", 404)
    out = product_out(p)
    if current_user()["rol"] != "admin":
        out.pop("cost", None)
    return jsonify(out)


@app.get("/api/products/next-code")
@admin_required
def api_next_code():
    with db.connect() as c:
        return jsonify(code=next_internal_code(c))


@app.post("/api/products")
@admin_required
def api_product_create():
    data = request.get_json(silent=True) or {}
    try:
        vals = clean_product(data)
        stock = int(data.get("stock") or 0)
    except ValueError as e:
        return err(str(e))
    with db.connect() as c:
        code = str(data.get("barcode") or "").strip() or next_internal_code(c)
        if c.one("SELECT id FROM productos WHERE codigo_barra = %s", (code,)):
            return err("barcode_exists")
        vals.update(codigo_barra=code[:100], cantidad_stock=stock, creado=utcnow())
        vals.setdefault("costo", Decimal("0"))
        vals.setdefault("categoria", "Other")
        cols = ", ".join(vals)
        ph = ", ".join(["%s"] * len(vals))
        pid = c.insert(f"INSERT INTO productos ({cols}) VALUES ({ph})", list(vals.values()))
        if stock:
            log_stock(c, pid, stock, stock, "Initial stock", current_user()["id"])
        return jsonify(product_out(c.one("SELECT * FROM productos WHERE id = %s", (pid,)))), 201


@app.put("/api/products/<int:pid>")
@admin_required
def api_product_update(pid):
    data = request.get_json(silent=True) or {}
    try:
        vals = clean_product(data, partial=True)
    except ValueError as e:
        return err(str(e))
    with db.connect() as c:
        p = c.one("SELECT * FROM productos WHERE id = %s", (pid,))
        if not p:
            return err("not_found", 404)
        if data.get("barcode") and str(data["barcode"]).strip() != p["codigo_barra"]:
            code = str(data["barcode"]).strip()[:100]
            if c.one("SELECT id FROM productos WHERE codigo_barra = %s AND id <> %s", (code, pid)):
                return err("barcode_exists")
            vals["codigo_barra"] = code
        if "stock" in data and data["stock"] is not None:
            new_stock = int(data["stock"])
            delta = new_stock - int(p["cantidad_stock"] or 0)
            if delta:
                vals["cantidad_stock"] = new_stock
                log_stock(c, pid, delta, new_stock, "Edited by admin", current_user()["id"])
        if vals:
            sets = ", ".join(f"{k} = %s" for k in vals)
            c.execute(f"UPDATE productos SET {sets} WHERE id = %s", list(vals.values()) + [pid])
        return jsonify(product_out(c.one("SELECT * FROM productos WHERE id = %s", (pid,))))


@app.delete("/api/products/<int:pid>")
@admin_required
def api_product_delete(pid):
    with db.connect() as c:
        used = c.one("SELECT id FROM detalle_ventas WHERE producto_id = %s", (pid,))
        if used:
            # keep sales history intact: hide instead of delete
            c.execute("UPDATE productos SET activo = 0 WHERE id = %s", (pid,))
            return jsonify(ok=True, archived=True)
        c.execute("DELETE FROM movimientos_stock WHERE producto_id = %s", (pid,))
        c.execute("DELETE FROM productos WHERE id = %s", (pid,))
    return jsonify(ok=True, archived=False)


@app.post("/api/products/<int:pid>/stock")
@admin_required
def api_product_stock(pid):
    data = request.get_json(silent=True) or {}
    try:
        delta = int(data.get("delta"))
    except (TypeError, ValueError):
        return err("bad_quantity")
    if delta == 0:
        return err("bad_quantity")
    reason = str(data.get("reason") or ("Received" if delta > 0 else "Adjustment")).strip()
    with db.connect() as c:
        p = c.one("SELECT * FROM productos WHERE id = %s", (pid,))
        if not p:
            return err("not_found", 404)
        final = int(p["cantidad_stock"] or 0) + delta
        c.execute("UPDATE productos SET cantidad_stock = %s WHERE id = %s", (final, pid))
        log_stock(c, pid, delta, final, reason, current_user()["id"])
        return jsonify(product_out(c.one("SELECT * FROM productos WHERE id = %s", (pid,))))


@app.get("/api/products/<int:pid>/history")
@admin_required
def api_product_history(pid):
    with db.connect() as c:
        rows = c.all("SELECT m.*, u.nombre AS usuario FROM movimientos_stock m "
                     "LEFT JOIN usuarios u ON u.id = m.usuario_id WHERE m.producto_id = %s "
                     "ORDER BY m.fecha DESC, m.id DESC", (pid,))[:100]
    return jsonify([{"change": r["cambio"], "final": r["stock_final"], "reason": r["motivo"],
                     "user": r["usuario"], "date": iso_local(r["fecha"])} for r in rows])


HEADER_MAP = {
    "barcode": "barcode", "codigo": "barcode", "código": "barcode", "codigo_barra": "barcode",
    "code": "barcode", "sku": "barcode",
    "name": "name", "nombre": "name", "product": "name", "producto": "name",
    "category": "category", "categoria": "category", "categoría": "category",
    "price": "price", "precio": "price",
    "cost": "cost", "costo": "cost",
    "stock": "stock", "cantidad": "stock", "qty": "stock", "quantity": "stock",
    "size": "size", "talla": "size", "color": "color",
    "min_stock": "min_stock", "minimo": "min_stock", "mínimo": "min_stock",
    "description": "description", "descripcion": "description", "descripción": "description",
}


@app.post("/api/products/import")
@admin_required
def api_products_import():
    if "file" in request.files:
        raw = request.files["file"].read().decode("utf-8-sig", errors="replace")
    else:
        raw = (request.get_json(silent=True) or {}).get("csv", "")
    if not raw.strip():
        return err("empty_file")
    sample = raw[:2000]
    delim = ";" if sample.count(";") > sample.count(",") else ","
    reader = csv.DictReader(io.StringIO(raw), delimiter=delim)
    created = updated = 0
    errors = []
    with db.connect() as c:
        for i, row in enumerate(reader, start=2):
            r = {}
            for k, v in row.items():
                if k is None:
                    continue
                key = HEADER_MAP.get(k.strip().lower())
                if key:
                    r[key] = (v or "").strip()
            if not r.get("name") and not r.get("barcode"):
                continue
            try:
                for num in ("price", "cost"):
                    if r.get(num):
                        r[num] = r[num].replace("$", "").replace(",", "")
                stock = int(float(r["stock"])) if r.get("stock") else None
                code = r.get("barcode") or ""
                existing = c.one("SELECT * FROM productos WHERE codigo_barra = %s", (code,)) if code else None
                if existing:
                    vals = clean_product({k: v for k, v in r.items() if v != ""}, partial=True)
                    if stock is not None and stock != int(existing["cantidad_stock"] or 0):
                        vals["cantidad_stock"] = stock
                        log_stock(c, existing["id"], stock - int(existing["cantidad_stock"] or 0),
                                  stock, "CSV import", current_user()["id"])
                    if vals:
                        sets = ", ".join(f"{k} = %s" for k in vals)
                        c.execute(f"UPDATE productos SET {sets} WHERE id = %s",
                                  list(vals.values()) + [existing["id"]])
                    updated += 1
                else:
                    vals = clean_product(r)
                    vals.update(codigo_barra=(code or next_internal_code(c))[:100],
                                cantidad_stock=stock or 0, creado=utcnow())
                    vals.setdefault("costo", Decimal("0"))
                    vals.setdefault("categoria", "Other")
                    cols = ", ".join(vals)
                    pid = c.insert(f"INSERT INTO productos ({cols}) VALUES ({', '.join(['%s'] * len(vals))})",
                                   list(vals.values()))
                    if stock:
                        log_stock(c, pid, stock, stock, "CSV import", current_user()["id"])
                    created += 1
            except (ValueError, ArithmeticError) as e:
                errors.append({"line": i, "error": str(e)})
    return jsonify(created=created, updated=updated, errors=errors[:50])


@app.get("/api/export/products.csv")
@admin_required
def api_export_products():
    with db.connect() as c:
        rows = c.all("SELECT * FROM productos WHERE COALESCE(activo, 1) = 1 ORDER BY nombre")
    buf = io.StringIO()
    w = csv.writer(buf)
    w.writerow(["barcode", "name", "category", "size", "color", "price", "cost", "stock", "min_stock"])
    for p in rows:
        o = product_out(p)
        w.writerow([o["barcode"], o["name"], o["category"], o["size"], o["color"],
                    f"{o['price']:.2f}", f"{o['cost']:.2f}", o["stock"], o["min_stock"]])
    return Response("﻿" + buf.getvalue(), mimetype="text/csv",
                    headers={"Content-Disposition": "attachment; filename=sapphire-products.csv"})


# --------------------------------------------------------------------------- sales

def compute_totals(subtotal, discount, s):
    subtotal = money(subtotal)
    discount = min(max(money(discount), Decimal("0")), subtotal)
    taxable = subtotal - discount
    rate = Decimal(str(s["vat_rate"])) / 100 if s["vat_enabled"] else Decimal("0")
    if rate and s["prices_include_vat"]:
        total = taxable
        vat = money(taxable - taxable / (1 + rate))
    else:
        vat = money(taxable * rate)
        total = taxable + vat
    return subtotal, discount, vat, money(total)


def sale_out(c, v, with_items=True):
    out = {
        "id": v["id"], "number": v["numero_factura"], "date": iso_local(v["fecha"]),
        "subtotal": f(v["subtotal"]), "discount": f(v.get("descuento")), "vat": f(v["vat"]),
        "total": f(v["total"]), "method": v["metodo_pago"], "cash": f(v.get("efectivo")) if v.get("efectivo") is not None else None,
        "change": f(v.get("cambio")) if v.get("cambio") is not None else None,
        "voided": bool(v.get("anulada")), "void_reason": v.get("motivo_anulacion") or "",
        "cashier": v.get("cashier") or "",
    }
    if with_items:
        items = c.all("SELECT d.*, p.nombre AS pnombre, p.codigo_barra AS pcodigo FROM detalle_ventas d "
                      "LEFT JOIN productos p ON p.id = d.producto_id WHERE d.venta_id = %s ORDER BY d.id",
                      (v["id"],))
        out["items"] = [{"product_id": i["producto_id"], "name": i.get("nombre") or i.get("pnombre") or "Item",
                         "barcode": i.get("codigo") or i.get("pcodigo") or "", "qty": int(i["cantidad"]),
                         "price": f(i["precio_unitario"]), "total": f(i["subtotal"])} for i in items]
        out["items_count"] = sum(i["qty"] for i in out["items"])
    return out


@app.post("/api/sales")
@login_required
def api_sale_create():
    data = request.get_json(silent=True) or {}
    items = data.get("items") or []
    method = str(data.get("method") or "cash").lower()
    if method not in ("cash", "card", "transfer", "other"):
        return err("bad_method")
    if not items:
        return err("empty_cart")
    qty_by_id = {}
    for it in items:
        try:
            pid, q = int(it["id"]), int(it["qty"])
        except (KeyError, TypeError, ValueError):
            return err("bad_item")
        if q <= 0 or q > 999:
            return err("bad_quantity")
        qty_by_id[pid] = qty_by_id.get(pid, 0) + q

    user = current_user()
    with db.connect() as c:
        s = get_settings(c)
        lock = " FOR UPDATE" if db.IS_PG else ""
        lines = []
        subtotal = Decimal("0")
        for pid, q in qty_by_id.items():
            p = c.one("SELECT * FROM productos WHERE id = %s" + lock, (pid,))
            if not p or not p.get("activo", 1):
                return err("product_not_found", 404, product_id=pid)
            stock = int(p["cantidad_stock"] or 0)
            if stock < q and not s["allow_negative_stock"]:
                return err("insufficient_stock", 409, product_id=pid, name=p["nombre"], stock=stock)
            price = money(p["precio"])
            line_total = price * q
            subtotal += line_total
            lines.append((p, q, price, line_total))

        dtype = data.get("discount_type") or "amount"
        try:
            dval = Decimal(str(data.get("discount_value") or 0))
        except ArithmeticError:
            return err("bad_discount")
        discount = subtotal * dval / 100 if dtype == "percent" else dval
        subtotal, discount, vat, total = compute_totals(subtotal, discount, s)

        cash = change = None
        if method == "cash" and data.get("cash_received") not in (None, ""):
            try:
                cash = money(data["cash_received"])
            except ArithmeticError:
                return err("bad_cash")
            if cash < total:
                return err("cash_not_enough", total=f(total))
            change = cash - total

        vid = c.insert("INSERT INTO ventas (numero_factura, usuario_id, subtotal, vat, total, metodo_pago, "
                       "fecha, descuento, efectivo, cambio, anulada) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 0)",
                       ("TMP-" + uuid.uuid4().hex, user["id"], subtotal, vat, total, method, utcnow(),
                        discount, cash, change))
        number = f"S-{vid:06d}"
        c.execute("UPDATE ventas SET numero_factura = %s WHERE id = %s", (number, vid))
        for p, q, price, line_total in lines:
            c.insert("INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, subtotal, "
                     "nombre, codigo, categoria, costo_unitario) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)",
                     (vid, p["id"], q, price, line_total, p["nombre"], p["codigo_barra"],
                      p.get("categoria") or "Other", money(p.get("costo"))))
            c.execute("UPDATE productos SET cantidad_stock = cantidad_stock - %s WHERE id = %s", (q, p["id"]))
        v = c.one("SELECT v.*, u.nombre AS cashier FROM ventas v JOIN usuarios u ON u.id = v.usuario_id "
                  "WHERE v.id = %s", (vid,))
        return jsonify(sale_out(c, v)), 201


@app.get("/api/sales")
@login_required
def api_sales():
    user = current_user()
    today = today_local()
    try:
        d_from = datetime.strptime(request.args.get("from", ""), "%Y-%m-%d").date()
    except ValueError:
        d_from = today
    try:
        d_to = datetime.strptime(request.args.get("to", ""), "%Y-%m-%d").date()
    except ValueError:
        d_to = d_from
    if user["rol"] != "admin":
        d_from = d_to = today  # cashiers only see today
    start, end = local_range(d_from, d_to)
    with db.connect() as c:
        rows = c.all("SELECT v.*, u.nombre AS cashier FROM ventas v LEFT JOIN usuarios u ON u.id = v.usuario_id "
                     "WHERE v.fecha >= %s AND v.fecha < %s ORDER BY v.fecha DESC, v.id DESC", (start, end))
        counts = {}
        if rows:
            ids = [r["id"] for r in rows]
            ph = ",".join(["%s"] * len(ids))
            for r in c.all(f"SELECT venta_id, SUM(cantidad) AS q FROM detalle_ventas WHERE venta_id IN ({ph}) "
                           f"GROUP BY venta_id", ids):
                counts[r["venta_id"]] = int(r["q"] or 0)
        out = []
        for r in rows:
            o = sale_out(c, r, with_items=False)
            o["items_count"] = counts.get(r["id"], 0)
            out.append(o)
    valid = [o for o in out if not o["voided"]]
    return jsonify(sales=out, summary={
        "count": len(valid), "total": round(sum(o["total"] for o in valid), 2),
        "items": sum(o["items_count"] for o in valid),
        "cash": round(sum(o["total"] for o in valid if o["method"] == "cash"), 2),
        "card": round(sum(o["total"] for o in valid if o["method"] == "card"), 2),
        "other": round(sum(o["total"] for o in valid if o["method"] not in ("cash", "card")), 2),
        "voided": len(out) - len(valid),
    }, range={"from": d_from.isoformat(), "to": d_to.isoformat()})


@app.get("/api/sales/<int:vid>")
@login_required
def api_sale(vid):
    with db.connect() as c:
        v = c.one("SELECT v.*, u.nombre AS cashier FROM ventas v LEFT JOIN usuarios u ON u.id = v.usuario_id "
                  "WHERE v.id = %s", (vid,))
        if not v:
            return err("not_found", 404)
        if current_user()["rol"] != "admin" and to_local(v["fecha"]).date() != today_local():
            return err("forbidden", 403)
        return jsonify(sale_out(c, v))


@app.post("/api/sales/<int:vid>/void")
@admin_required
def api_sale_void(vid):
    reason = str((request.get_json(silent=True) or {}).get("reason") or "Voided").strip()[:200]
    with db.connect() as c:
        v = c.one("SELECT * FROM ventas WHERE id = %s", (vid,))
        if not v:
            return err("not_found", 404)
        if v.get("anulada"):
            return err("already_voided")
        for d in c.all("SELECT producto_id, cantidad FROM detalle_ventas WHERE venta_id = %s", (vid,)):
            c.execute("UPDATE productos SET cantidad_stock = cantidad_stock + %s WHERE id = %s",
                      (d["cantidad"], d["producto_id"]))
            st = c.scalar("SELECT cantidad_stock FROM productos WHERE id = %s", (d["producto_id"],))
            if st is not None:
                log_stock(c, d["producto_id"], int(d["cantidad"]), int(st),
                          f"Sale {v['numero_factura']} voided", current_user()["id"])
        c.execute("UPDATE ventas SET anulada = 1, anulada_fecha = %s, anulada_por = %s, motivo_anulacion = %s "
                  "WHERE id = %s", (utcnow(), current_user()["id"], reason, vid))
    return jsonify(ok=True)


@app.get("/api/export/sales.csv")
@admin_required
def api_export_sales():
    try:
        d_from = datetime.strptime(request.args["from"], "%Y-%m-%d").date()
        d_to = datetime.strptime(request.args["to"], "%Y-%m-%d").date()
    except (KeyError, ValueError):
        d_to = today_local()
        d_from = d_to.replace(day=1)
    start, end = local_range(d_from, d_to)
    with db.connect() as c:
        rows = c.all("SELECT v.numero_factura, v.fecha, v.metodo_pago, v.anulada, u.nombre AS cashier, "
                     "COALESCE(d.codigo, p.codigo_barra) AS codigo, COALESCE(d.nombre, p.nombre) AS nombre, "
                     "COALESCE(d.categoria, p.categoria) AS categoria, d.cantidad, d.precio_unitario, d.subtotal, "
                     "COALESCE(d.costo_unitario, p.costo) AS costo_unitario, "
                     "v.descuento, v.vat, v.total FROM ventas v JOIN detalle_ventas d ON d.venta_id = v.id "
                     "LEFT JOIN productos p ON p.id = d.producto_id "
                     "LEFT JOIN usuarios u ON u.id = v.usuario_id WHERE v.fecha >= %s AND v.fecha < %s "
                     "ORDER BY v.fecha, v.id, d.id", (start, end))
    buf = io.StringIO()
    w = csv.writer(buf)
    w.writerow(["receipt", "date", "time", "cashier", "method", "voided", "barcode", "item", "category",
                "qty", "unit_price", "line_total", "unit_cost", "sale_discount", "sale_vat", "sale_total"])
    for r in rows:
        d = to_local(r["fecha"])
        w.writerow([r["numero_factura"], d.strftime("%Y-%m-%d"), d.strftime("%H:%M"), r["cashier"],
                    r["metodo_pago"], "yes" if r.get("anulada") else "", r.get("codigo") or "",
                    r.get("nombre") or "", r.get("categoria") or "", r["cantidad"],
                    f"{f(r['precio_unitario']):.2f}", f"{f(r['subtotal']):.2f}",
                    f"{f(r.get('costo_unitario')):.2f}", f"{f(r.get('descuento')):.2f}",
                    f"{f(r['vat']):.2f}", f"{f(r['total']):.2f}"])
    name = f"sapphire-sales-{d_from}-to-{d_to}.csv"
    return Response("﻿" + buf.getvalue(), mimetype="text/csv",
                    headers={"Content-Disposition": f"attachment; filename={name}"})


# --------------------------------------------------------------------------- stats

def _sales_with_lines(c, start, end):
    sales = c.all("SELECT v.*, u.nombre AS cashier FROM ventas v LEFT JOIN usuarios u ON u.id = v.usuario_id "
                  "WHERE v.fecha >= %s AND v.fecha < %s AND COALESCE(v.anulada, 0) = 0", (start, end))
    lines = c.all("SELECT d.*, p.nombre AS pnombre, p.categoria AS pcat, p.costo AS pcosto FROM detalle_ventas d "
                  "JOIN ventas v ON v.id = d.venta_id LEFT JOIN productos p ON p.id = d.producto_id "
                  "WHERE v.fecha >= %s AND v.fecha < %s AND COALESCE(v.anulada, 0) = 0", (start, end))
    return sales, lines


def _summarize(sales, lines):
    revenue = sum(f(s["total"]) for s in sales)
    vat = sum(f(s["vat"]) for s in sales)
    discount = sum(f(s.get("descuento")) for s in sales)
    cost = sum(f(l.get("costo_unitario") if l.get("costo_unitario") is not None else l.get("pcosto"))
               * int(l["cantidad"]) for l in lines)
    net = revenue - vat
    return {
        "revenue": round(revenue, 2), "vat": round(vat, 2), "discounts": round(discount, 2),
        "net": round(net, 2), "cost": round(cost, 2), "profit": round(net - cost, 2),
        "count": len(sales), "items": sum(int(l["cantidad"]) for l in lines),
        "avg_ticket": round(revenue / len(sales), 2) if sales else 0,
    }


@app.get("/api/stats/today")
@login_required
def api_stats_today():
    start, end = local_day_range(today_local())
    with db.connect() as c:
        sales, lines = _sales_with_lines(c, start, end)
    s = _summarize(sales, lines)
    if current_user()["rol"] != "admin":
        for k in ("cost", "profit"):
            s.pop(k, None)
    return jsonify(s)


@app.get("/api/stats/month")
@admin_required
def api_stats_month():
    try:
        y, m = map(int, (request.args.get("month") or "").split("-"))
        first = datetime(y, m, 1).date()
    except ValueError:
        first = today_local().replace(day=1)
    nxt = (first.replace(day=28) + timedelta(days=4)).replace(day=1)
    last = nxt - timedelta(days=1)
    prev_first = (first - timedelta(days=1)).replace(day=1)
    start, end = local_range(first, last)
    pstart, pend = local_range(prev_first, first - timedelta(days=1))

    with db.connect() as c:
        sales, lines = _sales_with_lines(c, start, end)
        psales, plines = _sales_with_lines(c, pstart, pend)
        products = c.all("SELECT * FROM productos WHERE COALESCE(activo, 1) = 1")
        start30 = utcnow() - timedelta(days=30)
        sold30 = {r["producto_id"]: int(r["q"] or 0) for r in c.all(
            "SELECT d.producto_id, SUM(d.cantidad) AS q FROM detalle_ventas d JOIN ventas v ON v.id = d.venta_id "
            "WHERE v.fecha >= %s AND COALESCE(v.anulada, 0) = 0 GROUP BY d.producto_id", (start30,))}

    summary = _summarize(sales, lines)
    prev = _summarize(psales, plines)

    def pct(a, b):
        return round((a - b) / b * 100, 1) if b else None

    by_day = {}
    d = first
    while d <= last:
        by_day[d.isoformat()] = {"date": d.isoformat(), "revenue": 0.0, "count": 0}
        d += timedelta(days=1)
    by_hour = [{"hour": h, "revenue": 0.0, "count": 0} for h in range(24)]
    by_weekday = [{"day": i, "revenue": 0.0, "count": 0} for i in range(7)]
    by_method, by_cashier = {}, {}
    for s_ in sales:
        ld = to_local(s_["fecha"])
        key = ld.date().isoformat()
        tot = f(s_["total"])
        if key in by_day:
            by_day[key]["revenue"] += tot
            by_day[key]["count"] += 1
        by_hour[ld.hour]["revenue"] += tot
        by_hour[ld.hour]["count"] += 1
        by_weekday[ld.weekday()]["revenue"] += tot
        by_weekday[ld.weekday()]["count"] += 1
        by_method[s_["metodo_pago"]] = by_method.get(s_["metodo_pago"], 0) + tot
        cn = s_.get("cashier") or "—"
        by_cashier.setdefault(cn, {"name": cn, "revenue": 0.0, "count": 0})
        by_cashier[cn]["revenue"] += tot
        by_cashier[cn]["count"] += 1

    by_cat, by_prod = {}, {}
    for l in lines:
        cat = l.get("categoria") or l.get("pcat") or "Other"
        amt = f(l["subtotal"])
        q = int(l["cantidad"])
        by_cat.setdefault(cat, {"category": cat, "revenue": 0.0, "qty": 0})
        by_cat[cat]["revenue"] += amt
        by_cat[cat]["qty"] += q
        pid = l["producto_id"]
        by_prod.setdefault(pid, {"id": pid, "name": l.get("nombre") or l.get("pnombre") or "Item",
                                 "qty": 0, "revenue": 0.0})
        by_prod[pid]["qty"] += q
        by_prod[pid]["revenue"] += amt

    inv_cost = sum(f(p.get("costo")) * max(0, int(p["cantidad_stock"] or 0)) for p in products)
    inv_retail = sum(f(p["precio"]) * max(0, int(p["cantidad_stock"] or 0)) for p in products)
    low = [product_out(p) for p in products
           if int(p["cantidad_stock"] or 0) <= int(p["stock_minimo"] if p.get("stock_minimo") is not None else 2)]
    low.sort(key=lambda p: p["stock"])
    slow = [dict(product_out(p), sold_30d=0) for p in products
            if int(p["cantidad_stock"] or 0) > 0 and sold30.get(p["id"], 0) == 0]
    slow.sort(key=lambda p: -p["stock"] * p["price"])

    r2 = lambda rows: [{k: (round(v, 2) if isinstance(v, float) else v) for k, v in r.items()} for r in rows]
    return jsonify({
        "month": first.strftime("%Y-%m"),
        "summary": summary,
        "previous": prev,
        "change": {"revenue": pct(summary["revenue"], prev["revenue"]),
                   "count": pct(summary["count"], prev["count"]),
                   "profit": pct(summary["profit"], prev["profit"])},
        "by_day": r2(list(by_day.values())),
        "by_hour": r2(by_hour),
        "by_weekday": r2(by_weekday),
        "by_method": {k: round(v, 2) for k, v in by_method.items()},
        "by_cashier": r2(sorted(by_cashier.values(), key=lambda x: -x["revenue"])),
        "by_category": r2(sorted(by_cat.values(), key=lambda x: -x["revenue"])),
        "top_products": r2(sorted(by_prod.values(), key=lambda x: (-x["qty"], -x["revenue"]))[:10]),
        "inventory": {
            "products": len(products),
            "units": sum(max(0, int(p["cantidad_stock"] or 0)) for p in products),
            "value_cost": round(inv_cost, 2), "value_retail": round(inv_retail, 2),
            "low_stock_count": len(low), "out_of_stock": sum(1 for p in products if int(p["cantidad_stock"] or 0) <= 0),
        },
        "low_stock": low[:15],
        "slow_movers": slow[:10],
    })


# --------------------------------------------------------------------------- users

@app.get("/api/users")
@admin_required
def api_users():
    with db.connect() as c:
        rows = c.all("SELECT id, username, rol, nombre, activo FROM usuarios ORDER BY rol, nombre")
    return jsonify([{"id": r["id"], "username": r["username"], "role": r["rol"], "name": r["nombre"],
                     "active": bool(r["activo"])} for r in rows])


@app.post("/api/users")
@admin_required
def api_user_create():
    d = request.get_json(silent=True) or {}
    username = str(d.get("username", "")).strip().lower()
    name = str(d.get("name", "")).strip()
    role = d.get("role") if d.get("role") in ("admin", "cashier") else "cashier"
    pw = str(d.get("password", ""))
    if not username or not name:
        return err("missing_fields")
    if len(pw) < 6:
        return err("password_too_short")
    with db.connect() as c:
        if c.one("SELECT id FROM usuarios WHERE LOWER(username) = %s", (username,)):
            return err("username_exists")
        c.insert("INSERT INTO usuarios (username, password, rol, nombre, activo, must_change) "
                 "VALUES (%s, %s, %s, %s, 1, 0)", (username, generate_password_hash(pw), role, name))
    return jsonify(ok=True), 201


@app.put("/api/users/<int:uid>")
@admin_required
def api_user_update(uid):
    d = request.get_json(silent=True) or {}
    me = current_user()
    with db.connect() as c:
        u = c.one("SELECT * FROM usuarios WHERE id = %s", (uid,))
        if not u:
            return err("not_found", 404)
        sets, params = [], []
        if d.get("name"):
            sets.append("nombre = %s")
            params.append(str(d["name"]).strip()[:100])
        if d.get("role") in ("admin", "cashier") and d["role"] != u["rol"]:
            if uid == me["id"]:
                return err("cannot_change_own_role")
            sets.append("rol = %s")
            params.append(d["role"])
        if "active" in d:
            active = 1 if d["active"] else 0
            if uid == me["id"] and not active:
                return err("cannot_disable_self")
            if not active and u["rol"] == "admin":
                n = c.scalar("SELECT COUNT(*) FROM usuarios WHERE rol = 'admin' AND activo = 1")
                if n <= 1:
                    return err("last_admin")
            sets.append("activo = %s")
            params.append(active)
        if d.get("password"):
            if len(str(d["password"])) < 6:
                return err("password_too_short")
            sets.append("password = %s")
            params.append(generate_password_hash(str(d["password"])))
            sets.append("must_change = 0")
        if sets:
            c.execute(f"UPDATE usuarios SET {', '.join(sets)} WHERE id = %s", params + [uid])
    return jsonify(ok=True)


# --------------------------------------------------------------------------- boot

if os.environ.get("RENDER") and not db.IS_PG:
    # On Render the disk is wiped on every deploy/restart: never run without a real database.
    raise RuntimeError("DATABASE_URL is not set. In Render > Environment, add DATABASE_URL "
                       "with your PostgreSQL connection string (Neon or Render Postgres).")

try:
    init_db()
except Exception as e:  # keep the process alive so Render shows the error in logs
    print(f"DB init error: {e}")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), debug=bool(os.environ.get("DEBUG")))
