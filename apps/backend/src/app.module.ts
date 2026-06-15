import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ConversationsModule } from './conversations/conversations.module';
import { MessagesModule } from './messages/messages.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [PrismaModule, ConversationsModule, MessagesModule, AiModule],
})
export class AppModule {}
