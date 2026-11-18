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
- `POST /api/chat/`: consultoría agronómica inteligente 24/7 mediante FloraBot IA.

## Módulos y Experiencia de Usuario Avanzada

1. **FloraBot IA (Asistente Agronómico Conversacional):**
   - Consume `POST /api/chat/` transmitiendo la telemetría viva de la maceta seleccionada (humedad de sustrato, temperatura ambiente, radiación solar y umbrales botánicos).
   - Renderizado adaptativo dual: ventana flotante compacta en escritorio (`bottom-6 right-6 w-[440px]`) y hoja inferior (*Bottom Sheet*) deslizante del 85% de altura en móviles (`h-[85vh]`) con fondo difuminado y manija táctil superior.
   - Formateo enriquecido con Marked.js: tablas con cabecera verde continua (`border-collapse: separate`) y chips táctiles para preguntas rápidas.

2. **Guía Interactiva (Onboarding Tour 6 Pasos):**
   - Recorrido paso a paso con efecto *spotlight* rojo neón pulsante (`tourRedPulse`) y fondo atenuado al 85% con `backdrop-filter: blur(6px)`.
   - Ajuste responsivo: lateral inteligente en computadores y hoja inferior con auto-desplazamiento compensado en móviles (`top - 70px`).

3. **Navegación Móvil con Menú Hamburguesa Animado:**
   - Despliegue y contracción suave con CSS Grid físico (`grid-template-rows: 0fr ➔ 1fr`).
   - Opciones táctiles para cambio de tema (OLED / Pastel), Guía Interactiva, refresco de sensores y cierre de sesión.

La búsqueda de especies, la ingesta de telemetría y el procesamiento de IA son responsabilidades de
API-Django. React no contiene claves de servicios externos ni implementa
modelos o migraciones Django.
