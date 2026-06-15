import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { GenerateRequest, GenerateResponse } from '@aichat/types';

@Injectable()
export class AiService {
  private readonly AI_SERVICE_URL =
    process.env.AI_SERVICE_URL || 'http://localhost:4001';

  async generate(
    messages: GenerateRequest['messages'],
  ): Promise<GenerateResponse> {
    try {
      const response = await fetch(`${this.AI_SERVICE_URL}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        body: JSON.stringify({ messages }),
      });

      if (!response.ok) {
        throw new Error(`AI service responded with status ${response.status}`);
      }

      return (await response.json()) as GenerateResponse;
    } catch (error) {
      console.error('AI Service call failed:', error);
      throw new HttpException(
        'Failed to generate AI response',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
