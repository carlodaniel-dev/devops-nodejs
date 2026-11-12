
set -euo pipefail
cd "$(dirname "$0")/.."

IMAGE="devsu-demo-api:local"

minikube addons enable ingress
minikube addons enable metrics-server

eval "$(minikube docker-env)"
docker build -t "$IMAGE" .

./scripts/create-secrets.sh
./scripts/create-tls-secret.sh

# Copia temporal de k8s/ para no modificar kustomization.yaml versionado
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
cp -r k8s/. "$TMP"
(cd "$TMP" && kustomize edit set image devsu-demo-api="$IMAGE")
kubectl apply -k "$TMP"

kubectl -n devsu-demo rollout status statefulset/postgres --timeout=180s
kubectl -n devsu-demo rollout status deployment/devsu-demo-api --timeout=180s
kubectl -n devsu-demo get pods,svc,ingress,hpa

echo
echo "Agrega a /etc/hosts:  $(minikube ip)  devsu-demo.local"
echo "Prueba:  curl -k https://devsu-demo.local/api/users"
