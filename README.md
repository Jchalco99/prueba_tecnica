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

## Estado de Avance

- [x] Configuración de Prisma 7 y migración inicial (`Equipo`, `Mantenimiento`, `TipoEquipo`)
- [x] Estructura Clean Architecture en Backend y Feature-Sliced Design en Frontend
- [x] Implementación completa de endpoints REST y lógica de mantenimiento en Backend
- [x] Implementación de la interfaz en Frontend (React + TypeScript + shadcn/ui + TailwindCSS)
- [ ] Script de automatización de despliegue (`deploy.sh`)

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
