FROM node:20-alpine AS build

WORKDIR /workspace
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/engine/package.json packages/engine/package.json
RUN npm ci --include-workspace-root

COPY apps/api apps/api
COPY packages/engine packages/engine
COPY prisma prisma
RUN npm run build:engine
RUN npx prisma generate --schema=prisma/schema.prisma
RUN npm run build:api

FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /workspace/package.json ./package.json
COPY --from=build /workspace/node_modules ./node_modules
COPY --from=build /workspace/apps/api/package.json ./apps/api/package.json
COPY --from=build /workspace/apps/api/dist ./apps/api/dist
COPY --from=build /workspace/packages/engine ./packages/engine
COPY --from=build /workspace/prisma ./prisma

EXPOSE 5000
CMD ["node", "apps/api/dist/server.js"]
