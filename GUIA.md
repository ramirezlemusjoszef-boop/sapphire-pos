# SAPPHIRE POS v2 — Guía de instalación y uso

Sistema de caja para la tienda: escanear productos, cobrar, imprimir recibo, descontar inventario y ver reportes.

- **Administrador:** productos, inventario, etiquetas con código de barras, resumen del mes (ventas, ganancia, lo más vendido, lo que no se vende, poco inventario), todas las ventas, anular ventas, usuarios y ajustes.
- **Cajera:** escanear, cobrar, imprimir recibo y ver solo las ventas de hoy.
- Inglés y español (botón ES/EN arriba).

---

## 1. Base de datos (IMPORTANTE)

La base de datos gratis de Render **se borra a los 30 días** y no tiene copias de seguridad. Por eso usamos **Neon**, que es gratis y no vence:

1. Entra a **neon.com**, crea una cuenta y un proyecto (región: *US East*).
2. En *Connection string* copia el link completo. Empieza con `postgresql://` y termina con `?sslmode=require`.

> Si en el futuro quieren pagar, la opción de Render es Postgres de $6/mes (no vence).

## 2. Subir el código a GitHub

En el repositorio `sapphire-pos`, reemplaza **todos** los archivos viejos por los de esta carpeta (borra `templates/` y `static/` viejos antes de subir). Luego *Commit*.

## 3. Render

**Si ya tienes el servicio de Render del sistema viejo:**
1. Render → tu servicio → **Settings**:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn app:app --workers 1 --threads 8 --timeout 60 --bind 0.0.0.0:$PORT`
2. **Environment** → agrega o actualiza:
   - `DATABASE_URL` = el link de Neon
   - `SECRET_KEY` = cualquier texto largo y secreto (por ejemplo 40 letras y números al azar)
   - `PYTHON_VERSION` = `3.12.7`
   - `STORE_TZ` = `America/Nassau`
3. **Manual Deploy → Deploy latest commit.**

**Si es un servicio nuevo:** Render → **New → Blueprint** → elige el repo (usa el archivo `render.yaml`) → pega el `DATABASE_URL` cuando lo pida.

Si la base de datos del sistema viejo todavía existe y la usas como `DATABASE_URL`, **se conservan los productos, las ventas y los usuarios**. El sistema nuevo agrega las columnas que le faltan sin borrar nada.

### El plan gratis "se duerme"
Con el plan Free, si nadie usa la página por 15 minutos, la siguiente vez tarda **alrededor de 1 minuto** en abrir. Para una tienda abierta todo el día conviene el plan **Starter ($7/mes)**, que no se duerme. Se cambia en Render → Settings → Instance Type.

## 4. Primer ingreso

| Usuario | Contraseña inicial |
|---|---|
| `admin` | `admin123` |
| `cashier` | `cashier123` |

Al entrar por primera vez, el sistema **obliga a cambiar la contraseña**. En *Usuarios* puedes crear una cuenta para cada cajera con su nombre, así cada venta queda registrada a nombre de quien la hizo.

## 5. Computadora de la caja

### Impresora de recibos (térmica de 80 mm o 58 mm)
1. Instala el driver de la impresora y ponla como **impresora predeterminada** en Windows.
2. Clic derecho en el acceso directo de **Google Chrome** → *Propiedades* → en **Destino**, al final, agrega un espacio y `--kiosk-printing`. Queda algo así:
   `"C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk-printing`
3. Cierra **todas** las ventanas de Chrome y ábrelo desde ese acceso directo.
4. En el POS: *Ajustes → Imprimir recibo de prueba*. Debe imprimir **sin que salga ninguna ventana**.
5. Si el papel es de 58 mm, cámbialo en *Ajustes → Ancho del papel*.

Sin `--kiosk-printing` también imprime, pero sale la ventana de impresión y hay que darle "Imprimir".

### Escáner (pistola)
Cualquier escáner USB funciona: escribe el código como un teclado y al final manda Enter, que es como vienen de fábrica. No hay que configurar nada. El cursor del POS siempre está listo para escanear. Si la cajera estaba escribiendo en el campo de efectivo y escanea, el sistema igual reconoce el producto.

## 6. Cargar productos

- **Uno por uno:** *Productos → Nuevo producto* → escanea el código del producto en el campo "Código de barras" → nombre, categoría, talla, color, precio, costo e inventario.
- **Productos sin código (ropa, joyería):** pulsa **"Generar código"** y después imprime las etiquetas.
- **Muchos a la vez:** llena `plantilla-productos.csv` en Excel o Google Sheets → guárdalo como CSV → *Productos → Importar CSV*.
- **Etiquetas:** marca los productos (casillas) → *Imprimir etiquetas* → elige el tamaño: impresora de etiquetas 50×25 mm o 40×30 mm, o una hoja A4 de 21 etiquetas. Las copias vienen sugeridas según el inventario.
- **Llegó mercancía:** botón **± Inventario** del producto → escribe `+10` → motivo.

## 7. Uso diario (cajera)

1. Escanear los productos. Si uno no tiene código: **F2** para buscarlo por nombre.
2. Elegir **Efectivo / Tarjeta / Transferencia**. En efectivo, escribir lo que entregó el cliente (o tocar un botón rápido) y el sistema muestra el cambio.
3. **Cobrar (F9)**. El recibo se imprime solo. Al escanear el siguiente producto empieza la venta nueva.
4. Descuento: botón *Descuento* (monto o %).
5. *Ventas de hoy*: lista del día, reimprimir recibos e **imprimir el cierre del día** (totales por efectivo y tarjeta para cuadrar la caja).

Si alguien recarga la página por error, el carrito no se pierde.

## 8. Notas

- Los precios y el inventario los valida el servidor. No se puede vender más de lo que hay en inventario, salvo que se active esa opción en Ajustes.
- **Anular una venta** (solo el admin, en *Ventas*) devuelve los productos al inventario y la venta queda marcada como anulada, no se borra.
- Un producto que ya tiene ventas no se borra: se oculta, para no dañar los reportes.
- IVA: 10% por defecto, sumado al precio. Si tus precios ya incluyen el IVA, marca esa opción en Ajustes.
- Exportar a Excel: botones *Exportar CSV* en Productos y en Ventas.
