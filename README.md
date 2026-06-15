# ChatGPT-like Chat Application

A full-stack chat application with separate frontend, backend, and AI services.

## Tech Stack

- **Frontend**: Next.js 14, React, TanStack Query, TailwindCSS
- **Backend**: NestJS, Prisma ORM
- **AI Service**: NestJS (deterministic responses)
- **Database**: PostgreSQL 17
- **Package Manager**: pnpm (workspace monorepo)

## Prerequisites

- Node.js 18 or higher
- pnpm 8 or higher
- Docker and Docker Compose

## Quick Installation

### 1. Clone and Install Dependencies

```bash
# Clone repository
git clone <your-repository-url>
cd chat-assignment

# Install dependencies
pnpm install
```

# 2. Setup Database

```
# Start PostgreSQL with Docker
docker-compose up -d

# Generate Prisma client
pnpm --filter prisma generate

# Run database migrations
pnpm --filter prisma migrate dev --name init
```

# 3. Configure Environment
Create .env files:

apps/backend/.env
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/chatdb"
AI_SERVICE_URL="http://localhost:4001"
PORT=4000
```

apps/ai-service/.env
```
PORT=4001
```

apps/frontend/.env.local
```
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

# Running the Application
## Development Mode
run services individually:

```
bash
# Terminal 1 - Backend (port 4000)
pnpm run dev:backend

# Terminal 2 - AI Service (port 4001)
pnpm run dev:ai

# Terminal 3 - Frontend (port 3000)
pnpm run dev:frontend

```

## Access the Application

Frontend: http://localhost:3000

Backend API: http://localhost:4000/api

AI Service: http://localhost:4001



# License
MIT