# SmartGarden Web — Cliente IoT Botánico (React + Vite)

Aplicación web cliente desarrollada en **React + Vite**, **Axios**, **Three.js** y **Chart.js** que consume la API REST de **SmartGarden-API-Django** mediante autenticación **JWT (SimpleJWT)**.

- **URL pública de la API REST (Backend):** `https://smart-garden-api-django.vercel.app`

---

## ¿Qué problema resuelve y cómo usa la API?

**SmartGarden Web** resuelve la supervisión ambiental en tiempo real y la gestión remota de cultivos domésticos e invernaderos IoT multi-módulo:

1. **Autenticación segura con JWT (`SimpleJWT`):**
   - Obtiene el par de tokens (`access` y `refresh`) mediante `POST /api/token/`.
   - Adjunta automáticamente `Authorization: Bearer <access_token>` en todas las peticiones protegidas mediante interceptores de Axios.
   - Renueva automáticamente el token de acceso expirado consumiendo `POST /api/token/refresh/` sin interrumpir la sesión del operador.
   - Permite registrar nuevos operadores mediante `POST /api/auth/register/`.
2. **Visualización 3D y Analítica Histórica:**
   - **Gemelo Digital 3D (`Three.js`):** Renderiza un modelo 3D interactivo de la planta que reacciona visualmente al estado hídrico, térmico y lumínico reportado por la API.
   - **Gráfico Histórico y Umbrales (`Chart.js`):** Grafica las series temporales de `TelemetryLog` junto con los límites críticos de temperatura máxima y humedad mínima de cada especie.
   - **Simulador IoT Sincronizado:** Permite inyectar lecturas de prueba hacia `POST /api/modules/<id>/telemetry/` y sincronizar el estado entre múltiples sesiones conectadas a la misma cuenta.

---

## Requisitos e Instalación

- **Node.js** 20 o superior.

| Acción | Comando | Descripción |
| :--- | :--- | :--- |
| **Instalación** | `npm install` | Instala las dependencias del proyecto |
| **Desarrollo local** | `npm run dev` | Inicia el servidor de desarrollo Vite |
| **Compilación (Build)** | `npm run build` | Genera el bundle estático de producción en `dist/` |
| **Vista previa local** | `npm run preview` | Sirve localmente el contenido compilado en `dist/` |

---

## Variables de entorno (`VITE_*`)

La URL base del backend se configura mediante la variable pública:

```env
VITE_API_URL=https://smart-garden-api-django.vercel.app
```
URLs públicas:

```text
Backend:  https://smart-garden-api-django.vercel.app/
Frontend: https://smart-garden-web-react.vercel.app/
```

### Separación por entorno en Vercel

En **Vercel Dashboard → Project Settings → Environment Variables**, define `VITE_API_URL` por separado:

| Entorno | Uso | Valor recomendado para `VITE_API_URL` |
| :--- | :--- | :--- |
| **Development** | Desarrollo local (`.env` local, ignorado por Git) | URL local de tu servidor Django o `https://smart-garden-api-django.vercel.app` |
| **Preview** | Ramas de feature y Pull Requests en GitHub | `https://smart-garden-api-django.vercel.app` |
| **Production** | Rama principal (`main`) desplegada en producción | `https://smart-garden-api-django.vercel.app` |

> **Seguridad:** Nunca definas credenciales, contraseñas, `DATABASE_URL` ni `SECRET_KEY` en variables `VITE_*`.

---

## Endpoints consumidos por el Frontend

### Autenticación y Cuentas
- **Login (SimpleJWT):** `POST https://smart-garden-api-django.vercel.app/api/token/`
- **Renovación de Token (SimpleJWT):** `POST https://smart-garden-api-django.vercel.app/api/token/refresh/`
- **Registro de Usuario:** `POST https://smart-garden-api-django.vercel.app/api/auth/register/`

### Recursos Protegidos (`Authorization: Bearer <token>`)
- `GET /api/modules/` y `POST /api/modules/`
- `GET /api/user-plants/`, `POST /api/user-plants/` y `DELETE /api/user-plants/<id>/`
- `GET /api/telemetry/`, `GET /api/telemetry/?module=<id>` y `POST /api/modules/<id>/telemetry/`
- `GET /api/plants/search/?q=<query>`

---

## Colección de pruebas (`curl`)

### 1. Petición sin autenticación (debe rechazar acceso a ruta protegida con `401 Unauthorized`)
```bash
curl -i -X GET "https://smart-garden-api-django.vercel.app/api/user-plants/"
```

### 2. Registro de nuevo usuario (`POST /api/auth/register/`)
```bash
curl -i -X POST "https://smart-garden-api-django.vercel.app/api/auth/register/" \
  -H "Content-Type: application/json" \
  -d '{"username":"operador_demo","email":"operador_demo@inacap.cl","password":"Password123!","password_confirm":"Password123!"}'
```

### 3. Obtención de Token JWT (`POST /api/token/`)
```bash
curl -i -X POST "https://smart-garden-api-django.vercel.app/api/token/" \
  -H "Content-Type: application/json" \
  -d '{"username":"operador_demo","password":"Password123!"}'
```

### 4. Renovación de Token JWT (`POST /api/token/refresh/`)
```bash
curl -i -X POST "https://smart-garden-api-django.vercel.app/api/token/refresh/" \
  -H "Content-Type: application/json" \
  -d '{"refresh":"<PEGA_AQUI_TU_REFRESH_TOKEN>"}'
```

### 5. Consulta de recursos protegidos con `Bearer Token` (`GET /api/modules/` y `GET /api/telemetry/`)
```bash
curl -i -X GET "https://smart-garden-api-django.vercel.app/api/modules/" \
  -H "Authorization: Bearer <PEGA_AQUI_TU_ACCESS_TOKEN>"

curl -i -X GET "https://smart-garden-api-django.vercel.app/api/telemetry/" \
  -H "Authorization: Bearer <PEGA_AQUI_TU_ACCESS_TOKEN>"
```


