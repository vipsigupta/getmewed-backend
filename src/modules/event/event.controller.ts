import { Controller, Post, Get, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto, UpdateEventStatusDto, MarkArrivalDto } from './dto/event.dto';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';

@UseGuards(FirebaseAuthGuard)
@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  // Admin creates an itinerary event (e.g. "Sangeet", "Reception")
  @Post()
  createEvent(@Body() dto: CreateEventDto) {
    return this.eventService.createEvent(dto);
  }

  // Get full itinerary for a space
  @Get('space/:spaceId')
  getEvents(@Param('spaceId') spaceId: string) {
    return this.eventService.getEvents(spaceId);
  }

  // Admin: go live, complete, or reset event state
  // Triggers push notifications + socket broadcasts + auto feed post
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateEventStatusDto) {
    return this.eventService.updateEventStatus(id, dto);
  }

  // Guest or admin marks arrival at venue
  @Post('arrival')
  markArrival(@Body() dto: MarkArrivalDto) {
    return this.eventService.markArrival(dto);
  }
}
