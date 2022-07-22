FROM node:14-alpine3.14 AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM node:14-alpine3.14 AS runner
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN ls

ENV NODE_ENV production
EXPOSE 5000

CMD ["npm", "run", "server-dev"]
