import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { GenerateService } from './generate.service';
import type { GenerateResponse } from '@aichat/types';

interface GenerateRequest {
  messages: Array<{
    role: string;
    content: string;
  }>;
}

@Controller('generate')
export class GenerateController {
  constructor(private readonly generateService: GenerateService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async generate(@Body() body: GenerateRequest): Promise<GenerateResponse> {
    // Validate the request structure
    if (!body.messages || !Array.isArray(body.messages)) {
      throw new Error('Invalid request: messages array is required');
    }

    const response = await this.generateService.generateResponse(body.messages);

    return {
      response,
      usage: {
        promptTokens: body.messages.length * 10,
        completionTokens: response.length,
        totalTokens: body.messages.length * 10 + response.length,
      },
    };
  }
}
