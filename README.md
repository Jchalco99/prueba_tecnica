# Reto Fullstack Minero

> Pendiente: completar con el enunciado y requisitos específicos de la prueba técnica.

## Descripción

Aplicación web fullstack para el registro y gestión de mantenimiento de equipos mineros.

## Stack Tecnológico

- **Backend:** Node.js, Express, TypeScript, Prisma ORM, PostgreSQL
- **Frontend:** React, Vite, TypeScript, TailwindCSS
- **Despliegue:** Fly.io (Backend), Vercel (Frontend), PostgreSQL

## Estructura del Proyecto

```text
.
├── backend/    # API REST con Express + Prisma (Clean Architecture)
└── frontend/   # Interfaz web con React + Vite + TypeScript
```

## Requisitos de la Prueba

- [ ] Completar requisitos del backend
- [ ] Completar requisitos del frontend
- [ ] Configurar despliegue automatizado (`deploy.sh`)

## Cómo ejecutar localmente

### Backend

```bash
cd backend
npm install
npx prisma migrate dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```
