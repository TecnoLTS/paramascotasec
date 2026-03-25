#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-http://127.0.0.1:3000}"
HOST_HEADER="${2:-paramascotasec.com}"

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

REQUEST_HEADERS=(
  -H "Host: ${HOST_HEADER}"
  -H "Accept: application/json"
)

request_status() {
  local method="$1"
  local path="$2"
  local body="${3:-}"
  local output_file="$TMP_DIR/response.json"

  local curl_args=(
    -sS
    -o "$output_file"
    -w '%{http_code}'
    -X "$method"
    "${REQUEST_HEADERS[@]}"
  )

  if [[ -n "$body" ]]; then
    curl_args+=(
      -H 'Content-Type: application/json'
      --data "$body"
    )
  fi

  curl_args+=("${BASE_URL}${path}")
  curl "${curl_args[@]}"
}

assert_status() {
  local actual="$1"
  local expected="$2"
  local label="$3"
  if [[ "$actual" != "$expected" ]]; then
    echo "FAIL ${label}: expected ${expected}, got ${actual}" >&2
    return 1
  fi
  echo "OK   ${label}: ${actual}"
}

echo "Checking Paramascotas API route matrix against ${BASE_URL} (Host: ${HOST_HEADER})"

health_status="$(request_status GET /api/health)"
assert_status "$health_status" "200" "GET /api/health"

store_status="$(request_status GET /api/settings/store-status)"
assert_status "$store_status" "200" "GET /api/settings/store-status"

shipping_status="$(request_status GET /api/settings/shipping)"
assert_status "$shipping_status" "200" "GET /api/settings/shipping"

products_status="$(request_status GET /api/products)"
assert_status "$products_status" "200" "GET /api/products"

product_id="$(
  php -r '
    $raw = @file_get_contents($argv[1]);
    if ($raw === false) { exit(1); }
    $data = json_decode($raw, true);
    $items = $data;
    if (is_array($data) && array_key_exists("data", $data)) {
        $items = $data["data"];
    }
    if (!is_array($items) || !isset($items[0]["id"])) { exit(2); }
    echo $items[0]["id"];
  ' "$TMP_DIR/response.json"
)"

product_show_status="$(request_status GET "/api/products/${product_id}")"
assert_status "$product_show_status" "200" "GET /api/products/{id}"

admin_users_status="$(request_status GET /api/users)"
assert_status "$admin_users_status" "401" "GET /api/users without auth"

admin_tax_status="$(request_status GET /api/admin/settings/tax)"
assert_status "$admin_tax_status" "401" "GET /api/admin/settings/tax without auth"

product_update_status="$(request_status PUT "/api/products/${product_id}" '{"published":false}')"
assert_status "$product_update_status" "401" "PUT /api/products/{id} without auth"

order_quote_status="$(request_status POST /api/orders/quote '{"items":[],"shippingCost":0}')"
if [[ "$order_quote_status" != "200" && "$order_quote_status" != "400" ]]; then
  echo "FAIL POST /api/orders/quote public access: expected 200 or 400, got ${order_quote_status}" >&2
  exit 1
fi
echo "OK   POST /api/orders/quote public access: ${order_quote_status}"

echo "Route audit completed successfully."
