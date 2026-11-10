# Contexto de integración

`Web-React` es exclusivamente el cliente React/Vite de SmartGarden. El
backend vive en `SmartGarden-API-Django` (`https://smart-garden-api-django.vercel.app`)
y es la única fuente de verdad para autenticación, módulos, plantas y telemetría.

## Flujo de autenticación SimpleJWT

1. **Inicio de sesión:** El cliente envía `username` y `password` a `POST /api/token/`.
2. **Emisión de tokens:** `SmartGarden-API-Django` devuelve el par JWT `access` y `refresh`.
3. **Peticiones autenticadas:** Axios envía el access token en el encabezado `Authorization: Bearer <token>`.
4. **Renovación automática:** Ante un `401 Unauthorized`, el interceptor solicita un nuevo `access` token a `POST /api/token/refresh/` enviando `{ "refresh": "<refresh_token>" }`; si el refresh también expiró, limpia la sesión y redirige a `/login`.
5. **Registro de nuevos operadores:** Envía `username`, `email`, `password` y `password_confirm` a `POST /api/auth/register/`.

## Recursos consumidos

- `POST /api/token/`: obtención de tokens JWT (`access` y `refresh`).
- `POST /api/token/refresh/`: renovación de token de acceso JWT.
- `POST /api/auth/register/`: creación de nuevas cuentas de usuario.
- `GET /api/modules/` y `POST /api/modules/`: módulos IoT pertenecientes al usuario autenticado.
- `GET /api/user-plants/`, `POST /api/user-plants/` y `DELETE /api/user-plants/<id>/`: plantas asignadas a sus módulos.
- `GET /api/telemetry/?module=<id>` y `POST /api/modules/<id>/telemetry/`: lecturas históricas y en tiempo real del módulo.
- `GET /api/plants/search/?q=<query>`: catálogo botánico de especies y umbrales fisiológicos.

La búsqueda de especies y la ingesta de telemetría son responsabilidades de
API-Django. React no contiene claves de servicios externos ni implementa
modelos o migraciones Django.
