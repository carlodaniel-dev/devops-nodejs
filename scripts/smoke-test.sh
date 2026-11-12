
set -euo pipefail

BASE_URL="${1:?Uso: smoke-test.sh <base-url>}"
# shellcheck disable=SC2206
CURL=(curl -sS --fail-with-body --max-time 10 ${CURL_OPTS:-})
DNI="smoke-$(date +%s)"

echo "-> GET /health";  "${CURL[@]}" "$BASE_URL/health"; echo
echo "-> GET /ready";   "${CURL[@]}" "$BASE_URL/ready"; echo
echo "-> POST /api/users"
CREATED="$("${CURL[@]}" -X POST "$BASE_URL/api/users" -H 'Content-Type: application/json' \
  -d "{\"dni\":\"$DNI\",\"name\":\"Smoke Test\"}")"
echo "$CREATED"
ID="$(echo "$CREATED" | sed -n 's/.*"id":\([0-9]*\).*/\1/p')"
echo "-> GET /api/users/$ID"; "${CURL[@]}" "$BASE_URL/api/users/$ID"; echo
echo "-> GET /api/users";     "${CURL[@]}" "$BASE_URL/api/users" >/dev/null && echo ok
echo "Smoke test OK"
