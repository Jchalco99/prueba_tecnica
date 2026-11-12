#!/usr/bin/env bash
set -Eeuo pipefail

# Colores para salida en terminal
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
VERCEL_LOG=""
CURRENT_STEP="Inicialización"

cleanup() {
  if [[ -n "$VERCEL_LOG" && -f "$VERCEL_LOG" ]]; then
    rm -f "$VERCEL_LOG"
  fi
}
trap cleanup EXIT

on_error() {
  local exit_code=$?
  echo -e "${RED}[ERROR] Falló el despliegue en el paso: ${CURRENT_STEP} (código de salida: ${exit_code}).${NC}" >&2
  exit 1
}
trap on_error ERR

log_step() {
  CURRENT_STEP="$1"
  echo -e "\n${BLUE}==> $1${NC}"
}

require_cmd() {
  local cmd="$1"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo -e "${RED}[ERROR] El comando requerido '$cmd' no está instalado o no está en el PATH.${NC}" >&2
    exit 1
  fi
}

require_file() {
  local file="$1"
  if [[ ! -f "$file" ]]; then
    echo -e "${RED}[ERROR] No se encontró el archivo requerido: $file${NC}" >&2
    exit 1
  fi
}

# 1. Verificar dependencias y archivos .env
log_step "1/5 Verificando dependencias y configuración"
require_cmd node
require_cmd npx
require_cmd vercel
require_cmd flyctl
require_cmd curl

require_file "$BACKEND_DIR/.env"
require_file "$FRONTEND_DIR/.env"
require_file "$BACKEND_DIR/fly.toml"
require_file "$FRONTEND_DIR/.vercel/project.json"

if ! grep -Eq '^[[:space:]]*DATABASE_URL[[:space:]]*=' "$BACKEND_DIR/.env"; then
  echo -e "${RED}[ERROR] DATABASE_URL no está definida en $BACKEND_DIR/.env.${NC}" >&2
  exit 1
fi

FLY_APP_NAME="$(sed -n "s/^[[:space:]]*app[[:space:]]*=[[:space:]]*['\"]\([^'\"]*\)['\"].*/\1/p" "$BACKEND_DIR/fly.toml" | head -n 1)"
if [[ -z "$FLY_APP_NAME" ]]; then
  echo -e "${RED}[ERROR] No se pudo leer el nombre de la app desde $BACKEND_DIR/fly.toml.${NC}" >&2
  exit 1
fi
BACKEND_URL="https://${FLY_APP_NAME}.fly.dev"

echo -e "${GREEN}Dependencias y archivos .env verificados correctamente.${NC}"

# 2. Desplegar Frontend en Vercel
log_step "2/5 Desplegando Frontend en Vercel"
VERCEL_LOG="$(mktemp)"
(
  cd "$FRONTEND_DIR"
  vercel --prod --yes 2>&1 | tee "$VERCEL_LOG"
)
FRONTEND_URL="$(grep -Eo 'https://[a-zA-Z0-9.-]+\.vercel\.app' "$VERCEL_LOG" | tail -n 1 || true)"

# 3. Desplegar Backend en Fly.io
log_step "3/5 Desplegando Backend en Fly.io ($FLY_APP_NAME)"
(
  cd "$BACKEND_DIR"
  flyctl deploy --yes
)

# 4. Aplicar migraciones en base de datos de producción
log_step "4/5 Aplicando migraciones de Prisma en producción"
(
  cd "$BACKEND_DIR"
  npx prisma migrate deploy
)

# 5. Comprobar salud de Backend (/health) y Frontend
log_step "5/5 Comprobando estado de los servicios desplegados"

HEALTH_STATUS="000"
for attempt in 1 2 3 4 5; do
  HEALTH_STATUS="$(curl -sS -o /dev/null -w "%{http_code}" "${BACKEND_URL}/health" || true)"
  if [[ "$HEALTH_STATUS" == "200" ]]; then
    break
  fi
  echo -e "${YELLOW}Intento ${attempt}/5: ${BACKEND_URL}/health respondió HTTP ${HEALTH_STATUS}. Reintentando en 3s...${NC}"
  sleep 3
done

if [[ "$HEALTH_STATUS" != "200" ]]; then
  echo -e "${RED}[ERROR] El endpoint ${BACKEND_URL}/health no devolvió 200 (respondió HTTP ${HEALTH_STATUS}).${NC}" >&2
  exit 1
fi
echo -e "${GREEN}Backend saludable: ${BACKEND_URL}/health -> HTTP 200${NC}"

if [[ -n "$FRONTEND_URL" ]]; then
  FRONTEND_STATUS="$(curl -sS -L -o /dev/null -w "%{http_code}" "$FRONTEND_URL" || true)"
  if [[ "$FRONTEND_STATUS" != "200" ]]; then
    echo -e "${RED}[ERROR] El frontend ${FRONTEND_URL} no devolvió 200 (respondió HTTP ${FRONTEND_STATUS}).${NC}" >&2
    exit 1
  fi
  echo -e "${GREEN}Frontend saludable: ${FRONTEND_URL} -> HTTP 200${NC}"
else
  echo -e "${YELLOW}[AVISO] No se pudo extraer automáticamente la URL de Vercel; verifica la salida del paso 2.${NC}"
fi

echo -e "\n${GREEN}=============================================${NC}"
echo -e "${GREEN}  DESPLIEGUE COMPLETADO CON ÉXITO${NC}"
echo -e "${GREEN}  Backend:  ${BACKEND_URL}${NC}"
if [[ -n "$FRONTEND_URL" ]]; then
  echo -e "${GREEN}  Frontend: ${FRONTEND_URL}${NC}"
fi
echo -e "${GREEN}=============================================${NC}"
exit 0
