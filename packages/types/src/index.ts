export interface Message {
  id: string
  role: 'USER' | 'ASSISTANT'
  content: string
  createdAt: Date
}

export interface Conversation {
  id: string
  title: string | null
  createdAt: Date
  updatedAt: Date
  messages?: Message[]
}

// AI Service Contracts
export interface GenerateRequest {
  messages: {
    role: string
    content: string
  }[]
}

export interface GenerateResponse {
  response: string
  usage?: {
    promptTokens?: number
    completionTokens?: number
    totalTokens?: number
  }
}

// Backend API Contracts
export interface CreateConversationResponse {
  id: string
}

export interface SendMessageRequest {
  content: string
}

export interface SendMessageResponse {
  userMessage: Message
  assistantMessage: Message
}