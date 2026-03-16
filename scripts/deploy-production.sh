#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${APP_DIR}"

if ! command -v docker >/dev/null 2>&1; then
  echo "docker no esta instalado"
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "docker compose no esta disponible"
  exit 1
fi

if ! docker network inspect edge >/dev/null 2>&1; then
  docker network create edge >/dev/null
fi

ENV_FILE=".env"
if [[ -f ".env.production" ]]; then
  ENV_FILE=".env.production"
elif [[ ! -f "${ENV_FILE}" ]]; then
  if [[ -f ".env.example" ]]; then
    cp .env.example "${ENV_FILE}"
    echo "Se creo ${ENV_FILE} desde .env.example. Ajusta valores de produccion antes de exponer."
  else
    echo "No se encontro ${ENV_FILE} ni .env.example"
    exit 1
  fi
fi

echo "Levantando Paramascotasec en produccion usando ${ENV_FILE}..."
docker compose --env-file "${ENV_FILE}" --profile production up -d --build --remove-orphans

docker compose --env-file "${ENV_FILE}" --profile production ps

echo "Paramascotasec produccion lista"
