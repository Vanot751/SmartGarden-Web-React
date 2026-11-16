# SmartGarden Web — Gemelo Digital 3D y Portal de Supervisión IoT

Portal web interactivo para la supervisión y gestión de cultivos botánicos inteligentes, desarrollado con **React + Vite**, **Three.js (WebGL)**, **Tailwind CSS**, **Lucide Icons** y **Chart.js**. Consume la API REST de **SmartGarden API-Django** y se sincroniza en tiempo real (< 30 ms) mediante **Firebase Realtime Database**.

- **URL de Producción (Vercel):** `https://smart-garden-web-react.vercel.app`
- **Backend API (Django):** `https://smart-garden-api-django.vercel.app`

---

## 🌟 Características Principales

### 1. Gemelo Digital 3D en Tiempo Real (Three.js)
- Visualización interactiva en WebGL de la maceta y espécimen botánico con controles orbitales de cámara.
- **Respuesta Fisiológica Dinámica**:
  - Color y textura del sustrato cambian en base a la humedad de suelo real (tierra seca arcillosa vs. tierra húmeda fértil).
  - Tonalidad foliar y efecto de luz de borde (*Rim Light*) que refleja el estrés térmico y la radiación solar recibida por los sensores.

### 2. Panel de Control de Actuadores y Parada de Emergencia
- **Ubicación Superior Ergonómica**: Situado directamente debajo de las tarjetas de sensores para acceso inmediato.
- **Aislamiento por Planta**: Los interruptores de Bomba de Agua (Pin D8), Nebulizador Ultrasónico y selector de dosificación (50 ml, 100 ml, 250 ml o personalizado) se almacenan de forma independiente por cada maceta en `localStorage` (`smartgarden_plant_actuators`).
- **Parada de Emergencia Global (E-STOP)**: Botón maestro de seguridad industrial que desactiva de inmediato todos los actuadores del invernadero.

### 3. Telemetría Histórica y Umbrales (Chart.js)
- Gráfico de curvas continuas de tendencia fisiológica (Temperatura ambiente, Humedad de suelo y Radiación solar) superpuestas con las líneas punteadas de los umbrales críticos de la especie.
- Selector interactivo de rango temporal: **Últimas 24 Horas** y **Últimos 7 Días**.

### 4. Aislamiento Multi-Usuario en Tiempo Real (Firebase RTDB)
- Conexión SSE bidireccional de baja latencia (< 30 ms).
- **Ruta Aislada por Operador**: Cada usuario escribe y escucha en su propio espacio:
  ```text
  https://smartgarden-web-react-iot-default-rtdb.firebaseio.com/telemetria/<nombre_usuario>/actual.json
  ```
  Garantizando que las demostraciones y simulaciones de un usuario no interfieran con las macetas ni las alertas en el teléfono de otro operador.

### 5. Gestión de Flota Botánica
- Conmutador de visualización entre **Vista Completa** (tarjetas expandidas con métricas) y **Vista Compacta** (listado rápido).
- Selección de maceta activa sincronizada con el Gemelo Digital 3D y el histórico de sensores.

---

## 🛠️ Tecnologías Empleadas

| Tecnología | Rol en el Proyecto |
| :--- | :--- |
| **React 19 + Vite** | Entorno de desarrollo ultrarrápido y renderizado SPA |
| **Three.js** | Modelado y renderizado del Gemelo Digital 3D en Canvas |
| **Tailwind CSS** | Estilizado responsivo con paleta orgánica y Modo Oscuro OLED |
| **Chart.js** | Visualización de telemetría histórica y curvas de umbrales |
| **Firebase Realtime Database** | Capa de sincronización reactiva en tiempo real (< 30ms) |
| **Axios** | Cliente HTTP con interceptores JWT y auto-renovación de token |

---

## 💻 Instalación y Desarrollo Local

### Requisitos
- **Node.js** 20.x o superior.
- **npm** o **pnpm**.

```bash
# 1. Clonar el repositorio y entrar a la carpeta
cd Web-React

# 2. Instalar dependencias
npm install

# 3. Iniciar el servidor local de desarrollo
npm run dev
```

El servidor estará accesible en `http://localhost:5173/`.

### Variables de Entorno (`.env`)
```env
VITE_API_URL=https://smart-garden-api-django.vercel.app
```

### Compilación para Producción
```bash
npm run build
```
Genera el paquete optimizado en la carpeta `dist/` listo para ser servido en Vercel o cualquier CDN.

---

## 🔒 Endpoints Consumidos

- `POST /api/token/` — Autenticación SimpleJWT (Access + Refresh tokens).
- `POST /api/token/refresh/` — Renovación automática de credenciales expiradas.
- `POST /api/auth/register/` — Registro de nuevos operadores.
- `GET /api/modules/` — Módulos IoT asociados a la cuenta.
- `GET/POST/DELETE /api/user-plants/` — Gestión de macetas en la flota del usuario.
- `GET /api/telemetry/` — Consulta de registros históricos de telemetría.
- `POST /api/modules/<id>/telemetry/` — Inyección y persistencia de lecturas de sensores.
