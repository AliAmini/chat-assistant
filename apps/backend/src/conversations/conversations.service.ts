import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConversationDto } from './dto/create-conversation.dto';

@Injectable()
export class ConversationsService {
  constructor(private prisma: PrismaService) {}

  async create(dto?: CreateConversationDto) {
    let conversationTitle = dto?.title;
    if (!conversationTitle) {
      const numberOfConversations = await this.prisma.conversation.count();
      conversationTitle = `New Conversation ${numberOfConversations + 1}`;
    }

    return this.prisma.conversation.create({
      data: {
        title: conversationTitle,
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findAll() {
    return this.prisma.conversation.findMany({
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        messages: {
          take: 1,
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException(`Conversation with ID ${id} not found`);
    }

    return conversation;
  }

  async updateTitle(id: string, title: string) {
    const conversation = await this.prisma.conversation.update({
      where: { id },
      data: { title },
    });

    return conversation;
  }
}
