#!/usr/bin/env bash
set -euo pipefail

echo "Candidatas de allowlist para ParamascotasEC"
echo

echo "IPs del servidor:"
hostname -I | tr ' ' '\n' | sed '/^$/d' | sed 's/^/  - /'
echo

echo "Subredes privadas detectadas:"
ip -o -4 addr show up scope global | awk '
  {
    split($4, a, "/");
    ip=a[1];
    prefix=a[2];
    if (ip ~ /^10\./ || ip ~ /^192\.168\./ || ip ~ /^172\.(1[6-9]|2[0-9]|3[0-1])\./) {
      if (prefix > 24) prefix = 24;
      split(ip, octets, ".");
      printf("  - %s.%s.%s.0/%s\n", octets[1], octets[2], octets[3], prefix);
    }
  }
' | sort -u
echo

echo "Conexiones recientes al gateway (80/443):"
ss -tn state established '( sport = :80 or sport = :443 )' 2>/dev/null \
  | awk 'NR>1 {print $5}' \
  | sed 's/.*ffff://; s/^\[//; s/\]$//' \
  | awk -F: '{print $1}' \
  | sed '/^$/d' \
  | sort -u \
  | sed 's/^/  - /' || true
echo

echo "Modo simple recomendado (sin conocer IPs exactas):"
echo "  PANEL_IP_MODE=private"
echo "  ADMIN_IP_MODE=private"
echo "  # private permite loopback + redes privadas RFC1918"
echo
echo "Sugerencia conservadora para desarrollo:"
echo "  PANEL_IP_ALLOWLIST=127.0.0.1,192.168.100.229,80.241.213.31"
echo "  ADMIN_IP_ALLOWLIST=127.0.0.1,192.168.100.229,80.241.213.31"
echo
echo "Antes de activar en produccion, confirma tus IPs cliente reales."
