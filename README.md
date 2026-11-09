# SmartGarden Web

Frontend independiente en React + Vite para consumir `SmartGarden-API-Django`.
Esta carpeta no contiene código, migraciones, base de datos ni configuración de
Django.

## Requisitos

- Node.js 20 o superior.
- Instancia activa del backend `SmartGarden-API-Django`.

## Instalación y comandos de compilación

| Acción | Comando | Descripción |
| :--- | :--- | :--- |
| **Instalación** | `npm install` | Instala las dependencias del proyecto |
| **Desarrollo local** | `npm run dev` | Inicia el servidor de desarrollo Vite |
| **Compilación (Build)** | `npm run build` | Genera el bundle estático de producción en `dist/` |
| **Vista previa local** | `npm run preview` | Sirve localmente el contenido compilado en `dist/` |

## Variables de entorno (`VITE_*`)

La URL base del backend se configura mediante la única variable pública requerida:

```env
VITE_API_URL=https://tu-backend-django.ejemplo.com
```

> **Nota:** `normalizeApiBaseUrl` acepta tanto la URL raíz del backend (`https://tu-backend.com`) como la URL con sufijo `/api` (`https://tu-backend.com/api`), evitando duplicar `/api/api/...`.

### Separación por entorno en Vercel (GitHub Integration nativa)

En **Vercel Dashboard → Project Settings → Environment Variables**, define `VITE_API_URL` por separado para cada entorno:

| Entorno | Uso | Ejemplo de valor para `VITE_API_URL` |
| :--- | :--- | :--- |
| **Development** | Desarrollo local (`.env` local o `vercel dev`) | URL local de tu servidor Django |
| **Preview** | Ramas de feature y Pull Requests en GitHub | `https://staging-smartgarden-api.ejemplo.com` |
| **Production** | Rama principal (`main`) desplegada en producción | `https://api-smartgarden.ejemplo.com` |

### Seguridad de variables en Vite

- **Nunca** almacenes credenciales, contraseñas, `DATABASE_URL`, `SECRET_KEY` ni claves privadas de APIs externas en variables con prefijo `VITE_*`, ya que Vite las incrusta públicamente en el bundle del navegador.
- Los archivos `.env` y `.env.*` (excepto `.env.example`) están excluidos en `.gitignore`.

## Enrutamiento SPA en Vercel (`vercel.json`)

El archivo `vercel.json` configura el directorio de salida `dist` y redirige todas las rutas de navegación (`/login`, `/dashboard`, etc.) hacia `/index.html` para que React Router y el portal SPA funcionen sin errores `404` al recargar la página.

## Contrato HTTP consumido

El frontend consume las rutas expuestas por `SmartGarden-API-Django`:

- `POST /api/auth/login/` y `POST /api/auth/register/`
- `GET /api/modules/` y `POST /api/modules/`
- `GET /api/user-plants/`, `POST /api/user-plants/` y `DELETE /api/user-plants/<id>/`
- `GET /api/telemetry/`, `GET /api/telemetry/?module=<id>` y `POST /api/modules/<id>/telemetry/`
- `GET /api/plants/search/?q=<query>`

El token JWT se guarda en `localStorage` y se envía como `Authorization: Bearer <token>`.

