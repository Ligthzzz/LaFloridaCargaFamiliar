# LaFlorida — Actualización de Cargas Familiares

Sistema para que funcionarios de la Municipalidad de La Florida soliciten actualizaciones de sus cargas familiares (agregar/modificar/eliminar un dependiente), adjuntando 3 documentos de respaldo. Un admin revisa cada solicitud y puede aprobarla, rechazarla u observarla con un comentario.

- **Backend**: NestJS + TypeORM + PostgreSQL (Controller → Service → Entity).
- **Frontend**: React + Vite, organizado con Atomic Design (`atoms` → `molecules` → `organisms` → `templates` → `pages`).
- **Auth**: JWT propio (sin sistema externo). Solo el admin crea cuentas de funcionario (no hay registro público).

## Requisitos

- Node.js 20+
- Docker Desktop (para PostgreSQL local, sin instalar nada más)

## 1. Levantar la base de datos

```bash
docker compose up -d
```

Esto levanta un contenedor de PostgreSQL en `localhost:5432` con los datos definidos en `docker-compose.yml`. No necesitas instalar Postgres en tu máquina.

## 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run start:dev
```

Con `NODE_ENV=development`, TypeORM crea las tablas automáticamente (`synchronize: true`) al conectar.

Crea el primer usuario admin (una sola vez):

```bash
npm run seed
```

Credenciales por defecto (editables en `.env`): `admin@laflorida.cl` / `Admin123!`.

El backend queda escuchando en `http://localhost:3000`.

## 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Abre `http://localhost:5173`.

## 4. Flujo de uso

1. Inicia sesión como admin (`admin@laflorida.cl` / `Admin123!`).
2. Ve a **Usuarios** y crea una cuenta de funcionario (RUT, nombre, email, contraseña).
3. Cierra sesión e inicia sesión con esa cuenta de funcionario.
4. Haz clic en **Actualizar carga familiar**, completa el formulario y adjunta los 3 documentos (PDF, JPG o PNG, máx. 5MB cada uno).
5. Vuelve a entrar como admin, abre la solicitud, revisa los archivos y apruébala, recházala u obsérvala dejando un comentario.
6. Entra de nuevo como el funcionario para ver el estado y el comentario del admin.

## Notas de seguridad (desarrollo)

- Límite de intentos de login: 5 cada 15 minutos por IP (`@nestjs/throttler`). Si lo alcanzas durante pruebas, reinicia el backend (el contador es en memoria) o espera.
- Los archivos subidos se validan por su contenido real (no solo por el `Content-Type` del navegador) y se guardan en `backend/uploads/` (ignorado por git).
- `backend/.env` y `frontend/.env` están en `.gitignore` — nunca commitear secretos reales; usar `.env.example` como referencia.
