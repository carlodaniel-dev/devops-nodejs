
set -euo pipefail

NAMESPACE="${NAMESPACE:-devsu-demo}"
SECRET_NAME="${SECRET_NAME:-devsu-demo-db}"
DB_USER="${DB_USER:-demo}"
DB_PASSWORD="${DB_PASSWORD:-$(openssl rand -base64 24 | tr -d '=+/')}"

kubectl create namespace "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -

if kubectl -n "$NAMESPACE" get secret "$SECRET_NAME" >/dev/null 2>&1 && [ "${FORCE:-false}" != "true" ]; then
  echo "Secret $SECRET_NAME ya existe en $NAMESPACE; no se modifica (FORCE=true para reemplazar)."
  exit 0
fi

kubectl -n "$NAMESPACE" create secret generic "$SECRET_NAME" \
  --from-literal=DB_USER="$DB_USER" \
  --from-literal=DB_PASSWORD="$DB_PASSWORD" \
  --dry-run=client -o yaml | kubectl apply -f -

echo "Secret $SECRET_NAME creado en $NAMESPACE."
