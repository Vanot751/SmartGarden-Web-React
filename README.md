# SmartGarden Web

Frontend independiente en React + Vite para consumir [API-Django](../API-Django).
Esta carpeta no contiene código, migraciones, base de datos ni configuración de
Django.

## Requisitos

- Node.js 20 o superior.
- API-Django ejecutándose en `http://127.0.0.1:8000`.

## Instalación y ejecución 

```powershell
npm install
npm run dev
```

La URL del backend se configura en `.env`:

```env
VITE_API_URL=http://127.0.0.1:8000
```

## Contrato utilizado

El frontend consume exclusivamente las rutas implementadas por API-Django:

- `POST /api/auth/login/`
- `POST /api/auth/refresh/`
- `GET /api/modules/`
- `GET /api/user-plants/`
- `GET /api/telemetry/?module=<id>`

El token JWT se guarda en `localStorage` y se envía como
`Authorization: Bearer <token>`. La búsqueda botánica y la ingesta de
telemetría pertenecen al backend; no se exponen claves externas en React.
