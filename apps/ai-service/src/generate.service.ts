import { Injectable } from '@nestjs/common';

@Injectable()
export class GenerateService {
  async generateResponse(
    messages: { role: string; content: string }[],
  ): Promise<string> {
    // Get the last user message
    const lastUserMessage = messages.filter((m) => m.role === 'user').pop();

    if (!lastUserMessage) {
      return "I'm not sure how to respond to that.";
    }

    // Deterministic responses for demonstration
    const responses = [
      `AI says: "${lastUserMessage.content}" - That's an interesting point!`,
      `Based on your message: "${lastUserMessage.content}", here's my response.`,
      `I've processed your input: "${lastUserMessage.content}". Let me think about that.`,
      `Interesting! You said: "${lastUserMessage.content}". Here's what I think about that.`,
    ];

    // Simple deterministic response based on message length
    const responseIndex = lastUserMessage.content.length % responses.length;

    // Simulate processing delay (200-500ms)
    await new Promise((resolve) =>
      setTimeout(resolve, 200 + Math.random() * 300),
    );

    return responses[responseIndex];
  }
}
