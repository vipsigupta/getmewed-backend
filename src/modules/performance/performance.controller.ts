import { Controller, Post, Get, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { PerformanceService } from './performance.service';
import {
  CreatePerformanceDto,
  UpdatePerformanceStatusDto,
  ReorderPerformanceDto,
} from './dto/performance.dto';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';

@UseGuards(FirebaseAuthGuard)
@Controller('performances')
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  // Add a new performance to the queue
  @Post()
  create(@Body() dto: CreatePerformanceDto) {
    return this.performanceService.create(dto);
  }

  // Get the live queue (excluding COMPLETED)
  @Get('queue/:spaceId')
  getQueue(@Param('spaceId') spaceId: string) {
    return this.performanceService.getQueue(spaceId);
  }

  // Admin: toggle UPCOMING → LIVE → COMPLETED
  // Triggers big screen takeover + feed post injection
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdatePerformanceStatusDto) {
    return this.performanceService.updateStatus(id, dto);
  }

  // Admin: drag-and-drop reorder queue
  @Patch(':spaceId/reorder')
  reorder(@Param('spaceId') spaceId: string, @Body() dto: ReorderPerformanceDto) {
    return this.performanceService.reorder(spaceId, dto);
  }
}
