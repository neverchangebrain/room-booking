import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @ApiOperation({ summary: 'Перевірка стану програми' })
  @ApiResponse({
    status: 200,
    description: 'Стан програми',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        info: {
          type: 'object',
          additionalProperties: { type: 'object' },
        },
        error: {
          type: 'object',
          additionalProperties: { type: 'object' },
        },
        details: {
          type: 'object',
          additionalProperties: { type: 'object' },
        },
      },
    },
  })
  healthCheck() {
    return this.appService.checkHealth();
  }
}
