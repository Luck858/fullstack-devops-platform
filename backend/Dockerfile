
# Stage 1: Install production dependencies
FROM node:22-alpine AS dependencies

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev \
    && npm cache clean --force


# Stage 2: Production runtime
FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Copy production dependencies
COPY --from=dependencies /app/node_modules ./node_modules

# Copy package configuration
COPY package*.json ./

# Copy application source
COPY . .

# Use non-root Node.js user
USER node

EXPOSE 5000

CMD ["node", "server.js"]
