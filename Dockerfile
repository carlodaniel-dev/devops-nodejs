# syntax=docker/dockerfile:1

# ---------- Stage 1: dependencias de producción ----------
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# npm ci = instalación reproducible a partir del lockfile; sin devDependencies
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

# ---------- Stage 2: imagen final ----------
FROM node:22-alpine AS runtime

LABEL org.opencontainers.image.title="devsu-demo-devops-nodejs" \
      org.opencontainers.image.description="Demo DevOps API (users) - Node.js + Express + PostgreSQL"

ENV NODE_ENV=production \
    PORT=8000

# La app arranca con "node" directamente: npm, npx, yarn y corepack no se usan en
# runtime. Se eliminan para reducir superficie de ataque (CVEs en el npm que trae
# la imagen base) y el tamaño de la imagen.
RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/corepack \
           /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack \
           /opt/yarn-* /usr/local/bin/yarn /usr/local/bin/yarnpkg

WORKDIR /app

# Solo lo necesario para ejecutar; ownership para el usuario no-root "node" (uid 1000)
COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node package.json app.js index.js ./
COPY --chown=node:node shared ./shared
COPY --chown=node:node users ./users
COPY --chown=node:node scripts ./scripts

USER node

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "index.js"]