import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { MessageRole } from '@aichat/prisma';

@Injectable()
export class MessagesService {
  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
  ) {}

  async sendMessage(conversationId: string, content: string) {
    // Verify conversation exists
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException(
        `Conversation with ID ${conversationId} not found`,
      );
    }

    // Save user message
    const userMessage = await this.prisma.message.create({
      data: {
        conversationId,
        role: MessageRole.USER,
        content,
      },
    });

    // Load conversation history for context
    const history = await this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      take: 20, // Limit context window
    });

    // Prepare messages for AI service
    const aiMessages = history.map((msg) => ({
      role: msg.role.toLowerCase(),
      content: msg.content,
    }));

    // Call AI service
    const aiResponse = await this.aiService.generate(aiMessages);

    // Save assistant message
    const assistantMessage = await this.prisma.message.create({
      data: {
        conversationId,
        role: MessageRole.ASSISTANT,
        content: aiResponse.response,
      },
    });

    // Update conversation's updatedAt timestamp
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return {
      userMessage,
      assistantMessage,
    };
  }

  async getConversationMessages(conversationId: string) {
    const messages = await this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });

    return messages;
  }
}
