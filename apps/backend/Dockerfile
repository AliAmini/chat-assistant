# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages ./packages
COPY apps/backend ./apps/backend

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install --frozen-lockfile

# Generate Prisma client
RUN cd packages/prisma && pnpm generate

# Build backend
RUN cd apps/backend && pnpm build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy built application
COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/node_modules ./node_modules
COPY --from=builder /app/packages ./packages

# Copy package.json for scripts
COPY apps/backend/package.json ./

EXPOSE 4000

CMD ["node", "dist/main"]