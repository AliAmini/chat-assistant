# Design Document: ChatGPT-like Chat Application

## 1. Executive Summary

This document outlines the architectural decisions, technical tradeoffs, and design rationale for a ChatGPT-like chat application. The system implements a clean separation of concerns with three distinct services: a Next.js frontend, a NestJS backend, and a dedicated AI service, all communicating over HTTP REST APIs with PostgreSQL as the data store.

## 2. Architecture Overview

### 2.1 High-Level Architecture

The system follows a **service-oriented architecture** with clear boundaries:

Frontend (Next.js) → Backend (NestJS) ↔ AI Service (NestJS)
↘ Database (PostgreSQL)


### 2.2 Service Boundaries

**Frontend Service**
- **Responsibility**: User interface, state management, API orchestration
- **Technology**: Next.js 14 with App Router, React Query for data fetching
- **Communication**: HTTP REST to Backend
- **Scale**: Can be horizontally scaled with CDN/load balancer

**Backend Service**
- **Responsibility**: Business logic, data persistence, conversation management
- **Technology**: NestJS, Prisma ORM
- **Communication**: HTTP REST to Frontend and AI Service
- **Scale**: Stateless, can be horizontally scaled

**AI Service**
- **Responsibility**: Response generation (AI/LLM logic)
- **Technology**: NestJS, deterministic response generator
- **Communication**: HTTP REST from Backend
- **Scale**: Can be scaled independently based on AI workload

**Database**
- **Technology**: PostgreSQL 17
- **Responsibility**: Persistent storage for conversations and messages

## 3. Data Flow

### 3.1 Create Conversation Flow
1. User clicks "New Conversation" in frontend
2. Frontend POSTs to `/api/conversations`
3. Backend creates record in PostgreSQL
4. Returns conversation ID to frontend
5. Frontend redirects to `/chat/{id}`

### 3.2 Send Message Flow
1. User submits message
2. Frontend POSTs to `/api/conversations/{id}/messages`
3. Backend:
   - Saves user message to database
   - Loads last 20 messages for context
   - Calls AI service `/generate` endpoint
   - Saves AI response to database
   - Returns both messages
4. Frontend updates UI with both messages

### 3.3 Data Models

```prisma
model Conversation {
  id        String    @id @default(uuid())
  title     String?
  messages  Message[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

model Message {
  id             String      @id @default(uuid())
  conversationId String
  role           MessageRole // USER or ASSISTANT
  content        String      @db.Text
  createdAt      DateTime    @default(now())
}