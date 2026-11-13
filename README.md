# Reto Fullstack Minero

Aplicación web fullstack para el registro, control de horómetro y gestión de mantenimientos preventivos de equipos mineros.

## Stack Tecnológico

- **Base de Datos:** PostgreSQL
- **Backend:** Node.js, Express 5, TypeScript, Prisma ORM 7 (`@prisma/adapter-pg`)
- **Frontend:** React 19, Vite, TypeScript, TailwindCSS
- **Despliegue:** Vercel (Frontend), Fly.io (Backend), Supabase/Neon (PostgreSQL)

## Estructura del Proyecto

```text
.
├── backend/                  # API REST (Clean Architecture)
│   ├── prisma/               # Esquema y migraciones de Prisma
│   └── src/
│       ├── domain/           # Entidades, enums, errores e interfaces de repositorio
│       ├── application/      # Casos de uso, DTOs y cálculo de mantenimiento
│       ├── infrastructure/   # Configuración env, cliente Prisma y repositorios
│       ├── presentation/     # Controladores, rutas, middlewares y servidor Express
│       └── index.ts          # Punto de entrada de la API
└── frontend/                 # Interfaz web (Feature-Sliced Design)
    └── src/
        ├── app/
        ├── pages/
        ├── widgets/
        ├── features/
        ├── entities/
        └── shared/
```

## Regla de Negocio: Cálculo de Mantenimiento

Cada equipo retorna el campo booleano calculado al vuelo `requiereMantenimiento`:

$$\text{requiereMantenimiento} = \text{horometro} \ge (\text{horometroUltimoMantenimiento} + \text{intervalo})$$

- Si el equipo no registra mantenimientos previos, se calcula desde `0`.
- **Intervalos por `TipoEquipo`:**
  - `CAMION`: cada **500** horas
  - `EXCAVADORA`: cada **250** horas
  - `PERFORADORA`: cada **100** horas

## Endpoints del Backend

| Método | Ruta | Protección | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Pública | Health check (`200 OK` -> `{ "status": "ok" }`) |
| `POST` | `/auth/register` | Pública | Registra un nuevo usuario (`role: USER`) y retorna `{ token, user }` |
| `POST` | `/auth/login` | Pública | Inicia sesión con correo y contraseña y retorna `{ token, user }` |
| `GET` | `/auth/me` | JWT Bearer | Retorna los datos del usuario autenticado (`{ user }`) |
| `GET` | `/equipos` | JWT Bearer | Lista todos los equipos si es `ADMIN`, o únicamente los del usuario si es `USER` |
| `POST` | `/equipos` | JWT Bearer | Crea un equipo asociado al usuario autenticado |
| `PUT` | `/equipos/:id` | JWT Bearer | Actualiza datos u horómetro del equipo (solo propietario o `ADMIN`) |
| `DELETE` | `/equipos/:id` | JWT Bearer | Elimina un equipo y su historial en cascada (solo propietario o `ADMIN`) |
| `POST` | `/equipos/:id/mantenimientos` | JWT Bearer | Registra mantenimiento para el equipo (solo propietario o `ADMIN`) |

### Cuenta Administrador preconfigurada

- **Correo:** `admin@minera.com`
- **Contraseña:** `admin123`
- **Rol:** `ADMIN` (lista y gestiona todos los equipos registrados en el sistema)

## URLs Públicas

- **Frontend (Vercel):** https://reto-mineros-frontend.vercel.app
- **Backend (Fly.io):** https://backend-frosty-haze-832.fly.dev
- **Health Check:** https://backend-frosty-haze-832.fly.dev/health

## Estado de Avance

- [x] Configuración de Prisma 7 y migración inicial (`Equipo`, `Mantenimiento`, `TipoEquipo`)
- [x] Sistema de Autenticación con JWT y tabla `Users` con roles (`USER` y `ADMIN`)
- [x] Aislamiento de equipos por usuario y vista global de supervisión para administradores
- [x] Estructura Clean Architecture en Backend y Feature-Sliced Design en Frontend
- [x] Implementación completa de endpoints REST y lógica de mantenimiento en Backend
- [x] Implementación de la interfaz en Frontend (React + TypeScript + shadcn/ui + TailwindCSS)
- [x] Script de automatización de despliegue (`deploy.sh`)

## Cómo ejecutar localmente

### 1. Backend

```bash
cd backend
cp .env.example .env
# Ajustar DATABASE_URL y JWT_SECRET en .env si es necesario
npm install
npm run prisma:deploy
npm run prisma:generate
npm run dev
```

El servidor quedará disponible en `http://localhost:3000`.

### 2. Pruebas rápidas de endpoints

```bash
# 1. Health check
curl http://localhost:3000/health

# 2. Iniciar sesión como Administrador para obtener el JWT
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@minera.com","password":"admin123"}'

# 3. Crear un equipo con el token Bearer obtenido
curl -X POST http://localhost:3000/equipos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN_JWT>" \
  -d '{"codigo":"CAM-001","tipo":"CAMION","horometro":500}'

# 4. Listar equipos (el admin verá todos los equipos; un usuario normal solo los suyos)
curl http://localhost:3000/equipos \
  -H "Authorization: Bearer <TOKEN_JWT>"

# 5. Registrar mantenimiento (reinicia el ciclo preventivo)
curl -X POST http://localhost:3000/equipos/1/mantenimientos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN_JWT>" \
  -d '{}'
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

## Cómo desplegar (Automatización)

El despliegue completo a producción se realiza con un único script idempotente en la raíz del repositorio: [`deploy.sh`](./deploy.sh).

### Requisitos previos

1. Tener instaladas y autenticadas las herramientas CLI: `node`, `npx`, `vercel`, `flyctl` y `curl`.
2. Tener configurados `backend/.env` (con la `DATABASE_URL` de producción en PostgreSQL/Neon) y `frontend/.env` (ver `.env.example` en cada carpeta).
3. Tener enlazados los proyectos de Fly.io (`backend/fly.toml` + secreto `DATABASE_URL` en Fly) y Vercel (`frontend/.vercel/project.json` + variable `VITE_API_URL` en Vercel).

### Ejecutar despliegue

Desde Git Bash (Windows) o cualquier terminal Unix:

```bash
chmod +x deploy.sh
./deploy.sh
```

El script ejecuta en orden:
1. Verifica que existan las CLIs requeridas (`node`, `npx`, `vercel`, `flyctl`, `curl`), los archivos `.env` y la configuración de Fly.io/Vercel.
2. Despliega el frontend en Vercel (`vercel --prod --yes`).
3. Despliega el backend en Fly.io (`flyctl deploy --yes`) usando [`backend/Dockerfile`](./backend/Dockerfile).
4. Aplica las migraciones de Prisma en producción (`npx prisma migrate deploy`).
5. Comprueba con `curl` que `/health` del backend y la URL del frontend respondan HTTP `200`. Si cualquier paso falla, se detiene inmediatamente con un mensaje de error y código de salida `1`.

## Uso de herramientas de IA

Se utilizó **Gemini (Antigravity)** como asistente de apoyo durante el desarrollo para la estructuración del código, configuración de despliegue (Docker, Fly.io y Vercel), redacción del script `deploy.sh` y documentación.
