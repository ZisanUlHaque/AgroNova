FROM node:20-alpine

WORKDIR /workspace
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/engine/package.json packages/engine/package.json
RUN npm ci --include-workspace-root

COPY apps/web apps/web
WORKDIR /workspace/apps/web
ENV NEXT_TELEMETRY_DISABLED=1
ENV API_INTERNAL_URL=http://api:5000/api/v1
EXPOSE 3000
RUN npm run build
CMD ["npm", "run", "start"]
