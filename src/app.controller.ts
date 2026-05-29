import { Controller, Get, Param, Header } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  getHealth() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get('invite/:code')
  @Header('Content-Type', 'text/html')
  async getInviteHtml(@Param('code') code: string): Promise<string> {
    return this.appService.getInviteHtml(code);
  }
}
