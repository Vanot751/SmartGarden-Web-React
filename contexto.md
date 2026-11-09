# Contexto de integración

`Web-React` es exclusivamente el cliente React/Vite de SmartGarden. El
backend vive en `../API-Django` y es la única fuente de verdad para
autenticación, módulos, plantas y telemetría.

## Flujo de autenticación

1. React envía `username` y `password` a `POST /api/auth/login/`.
2. API-Django devuelve `access` y `refresh`.
3. Axios envía el access token como `Authorization: Bearer <token>`.
4. Una respuesta `401` limpia la sesión y redirige a `/login`.

## Recursos consumidos

- `GET /api/modules/`: módulos pertenecientes al usuario autenticado.
- `GET /api/user-plants/`: plantas asignadas a sus módulos.
- `GET /api/telemetry/?module=<id>`: lecturas paginadas del módulo.

La búsqueda de especies y la ingesta de telemetría son responsabilidades de
API-Django. React no contiene claves de servicios externos ni implementa
modelos o migraciones Django.
