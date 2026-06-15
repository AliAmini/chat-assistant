# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages ./packages
COPY apps/ai-service ./apps/ai-service

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build AI service
RUN cd apps/ai-service && pnpm build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy built application
COPY --from=builder /app/apps/ai-service/dist ./dist
COPY --from=builder /app/apps/ai-service/node_modules ./node_modules
COPY --from=builder /app/packages ./packages

# Copy package.json for scripts
COPY apps/ai-service/package.json ./

EXPOSE 4001

CMD ["node", "dist/main"]