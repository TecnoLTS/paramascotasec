#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

ensure_docker_ready() {
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
}

resolve_env_file() {
  local mode="${1:-development}"

  if [[ "${mode}" == "development" ]]; then
    local env_file="${APP_DIR}/.env.development"
    if [[ -f "${env_file}" ]]; then
      printf '%s\n' "${env_file}"
      return 0
    fi

    if [[ -f "${APP_DIR}/.env.example" ]]; then
      cp "${APP_DIR}/.env.example" "${env_file}"
      echo "Se creo ${env_file} desde .env.example. Ajusta token y URLs si hace falta."
      printf '%s\n' "${env_file}"
      return 0
    fi

    echo "No se encontro ${env_file} ni .env.example" >&2
    exit 1
  fi

  if [[ -f "${APP_DIR}/.env.production" ]]; then
    printf '%s\n' "${APP_DIR}/.env.production"
    return 0
  fi

  if [[ -f "${APP_DIR}/.env" ]]; then
    printf '%s\n' "${APP_DIR}/.env"
    return 0
  fi

  if [[ -f "${APP_DIR}/.env.example" ]]; then
    cp "${APP_DIR}/.env.example" "${APP_DIR}/.env"
    echo "Se creo ${APP_DIR}/.env desde .env.example. Ajusta valores de produccion antes de exponer."
    printf '%s\n' "${APP_DIR}/.env"
    return 0
  fi

  echo "No se encontro .env, .env.production ni .env.example" >&2
  exit 1
}

compose_cmd() {
  local env_file="$1"
  local profile="$2"
  shift 2

  (
    cd "${APP_DIR}"
    docker compose --env-file "${env_file}" --profile "${profile}" "$@"
  )
}

deploy_frontend() {
  local mode="${1:-development}"
  local env_file

  ensure_docker_ready
  env_file="$(resolve_env_file "${mode}")"

  echo "Levantando Paramascotasec en ${mode} usando ${env_file}..."
  compose_cmd "${env_file}" "${mode}" up -d --build --remove-orphans
  compose_cmd "${env_file}" "${mode}" ps
  echo "Paramascotasec ${mode} listo"
}
