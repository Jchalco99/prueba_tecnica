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

| Método | Ruta | Descripción |
| :--- | :--- | :--- |
| `GET` | `/health` | Health check (`200 OK` → `{ "status": "ok" }`) |
| `GET` | `/equipos` | Lista todos los equipos con `mantenimientos` y `requiereMantenimiento` |
| `POST` | `/equipos` | Crea un equipo (`{ "codigo": "CAM-01", "tipo": "CAMION", "horometro": 0 }`) |
| `PUT` | `/equipos/:id` | Actualiza datos u horómetro de un equipo (`{ "horometro": 520 }`) |
| `DELETE` | `/equipos/:id` | Elimina un equipo y su historial en cascada |
| `POST` | `/equipos/:id/mantenimientos` | Registra mantenimiento (toma `horometroActual` del body o el `horometro` actual del equipo) |

## URLs Públicas

- **Frontend (Vercel):** https://reto-mineros-frontend.vercel.app
- **Backend (Fly.io):** https://backend-frosty-haze-832.fly.dev
- **Health Check:** https://backend-frosty-haze-832.fly.dev/health

## Estado de Avance

- [x] Configuración de Prisma 7 y migración inicial (`Equipo`, `Mantenimiento`, `TipoEquipo`)
- [x] Estructura Clean Architecture en Backend y Feature-Sliced Design en Frontend
- [x] Implementación completa de endpoints REST y lógica de mantenimiento en Backend
- [x] Implementación de la interfaz en Frontend (React + TypeScript + shadcn/ui + TailwindCSS)
- [x] Script de automatización de despliegue (`deploy.sh`)

## Cómo ejecutar localmente

### 1. Backend

```bash
cd backend
cp .env.example .env
# Ajustar DATABASE_URL en .env si es necesario
npm install
npx prisma migrate dev
npx prisma generate
npm run dev
```

El servidor quedará disponible en `http://localhost:3000`.

### 2. Pruebas rápidas de endpoints

```bash
# Health check
curl http://localhost:3000/health

# Crear un camión con 500 horas (requiereMantenimiento = true)
curl -X POST http://localhost:3000/equipos \
  -H "Content-Type: application/json" \
  -d '{"codigo":"CAM-001","tipo":"CAMION","horometro":500}'

# Listar equipos
curl http://localhost:3000/equipos

# Registrar mantenimiento (reinicia el ciclo -> requiereMantenimiento = false)
curl -X POST http://localhost:3000/equipos/1/mantenimientos \
  -H "Content-Type: application/json" \
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
