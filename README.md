# Timón Costa Chica · POS Comercial, KDS Cocina y Gestión Hotelera

Plataforma web fullstack responsiva y optimizada para pantallas táctiles y tablets, diseñada para restaurantes, ramadas frente al mar y hospedajes de Copala y Marquelia, Guerrero.

## Características Principales

- **Arquitectura Fullstack con MongoDB (Mongoose):** API REST en Express con autenticación JWT, control de roles (RBAC) y semilla comercial automática al iniciar en una base vacía.
- **Control de Acceso por Roles y PIN Táctil:**
  - `Administrador` (`1234`): Acceso total, gráficas, personal, ajustes fiscales y RESICO.
  - `Cajero POS` (`2222`): Cobro de cuentas abiertas, venta directa, gastos y Corte Z.
  - `Mesero` (`3333`): Comandero táctil por mesas/ramadas con envío en vivo a Cocina.
  - `Cocina / KDS` (`4444`): Pantalla de comandas por estación (Brasas, Barra Fría, Bebidas) con semáforo de tiempo.
  - `Recepción` (`5555`): Tablero de cabañas y cuartos (Libre, Ocupada, Limpieza, Reservada).
- **Facturación PDF y Tickets Térmicos 58mm / 80mm:** Generación instantánea de comprobantes/facturas PDF (con RFC, Régimen 626 RESICO, desglose de IVA y propina) e impresión dedicada para impresoras térmicas.
- **Gráficas Interactivas (Recharts) e IA Ligera Explicable:** Tendencia de ingresos vs egresos (14 días), métodos de cobro, top platillos y pronósticos diarios con sustento transparente.
- **Menú Digital QR y Reservas por WhatsApp:** Carrito público para pedidos directos y formulario de reserva de cabañas sin comisiones de terceros.

## Despliegue en VPS con Coolify

### Opción A: Docker Compose (App + MongoDB incluidos)
1. En Coolify, crea un recurso nuevo seleccionando **Git Repository** apuntando a `https://github.com/moscegr/restaurantecosta.git`.
2. Selecciona **Docker Compose** como Build Pack (Coolify detectará `docker-compose.yml`).
3. Configura las variables de entorno en Coolify:
   - `JWT_SECRET`: una cadena aleatoria segura.
   - `MONGODB_URI`: `mongodb://mongodb:27017/timon_costa_chica` (o tu MongoDB administrado en Coolify).
4. Asigna tu dominio al servicio `app` (puerto `4000`) y despliega.

### Opción B: Dockerfile (con MongoDB externo en Coolify)
1. Crea primero una base de datos **MongoDB** en Coolify y copia su URL de conexión.
2. Crea una aplicación desde este repositorio usando **Dockerfile** (puerto expuesto `4000`).
3. Agrega las variables `MONGODB_URI` y `JWT_SECRET` y despliega.

## Desarrollo Local

```bash
cp .env.example .env
npm install
npm run dev
```

- Frontend Vite: `http://localhost:5173`
- Backend API Express + MongoDB: `http://localhost:4000`
