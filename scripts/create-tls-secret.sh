
set -euo pipefail

NAMESPACE="${NAMESPACE:-devsu-demo}"
HOST="${HOST:-devsu-demo.local}"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

openssl req -x509 -newkey rsa:2048 -nodes -days 365 \
  -keyout "$TMP/tls.key" -out "$TMP/tls.crt" \
  -subj "/CN=$HOST" -addext "subjectAltName=DNS:$HOST" 2>/dev/null

kubectl create namespace "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -
kubectl -n "$NAMESPACE" create secret tls devsu-demo-tls \
  --cert="$TMP/tls.crt" --key="$TMP/tls.key" \
  --dry-run=client -o yaml | kubectl apply -f -

echo "Secret devsu-demo-tls creado para $HOST."
