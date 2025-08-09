FROM node:20-alpine AS base
WORKDIR /app
COPY package.json pnpm-lock.yaml* package-lock.json* yarn.lock* ./
RUN if [ -f pnpm-lock.yaml ]; then corepack enable && corepack prepare pnpm@latest --activate; fi
RUN if [ -f pnpm-lock.yaml ]; then pnpm install --frozen-lockfile; elif [ -f package-lock.json ]; then npm ci; else npm install; fi
COPY . .
RUN npm run build || pnpm run build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist
COPY ./.env ./.env
EXPOSE 3000
CMD ["node", "dist/main.js"]
