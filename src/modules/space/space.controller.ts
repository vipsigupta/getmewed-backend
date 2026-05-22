import { Controller, Post, Get, Patch, Body, Param } from '@nestjs/common';
import { SpaceService } from './space.service';
import { CreateSpaceDto, UpdateSpaceStatusDto } from './dto/space.dto';

@Controller('spaces')
export class SpaceController {
  constructor(private readonly spaceService: SpaceService) {}

  // Admin creates a new celebration space (wedding, birthday, etc.)
  @Post()
  createSpace(@Body() dto: CreateSpaceDto) {
    return this.spaceService.createSpace(dto);
  }

  // Get full space details (itinerary, guest count)
  @Get(':id')
  getSpace(@Param('id') id: string) {
    return this.spaceService.getSpace(id);
  }

  // Admin toggles the live state of the Space (UPCOMING → LIVE → COMPLETED)
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateSpaceStatusDto) {
    return this.spaceService.updateStatus(id, dto);
  }

  // Guest list for the space
  @Get(':id/guests')
  getGuests(@Param('id') id: string) {
    return this.spaceService.getGuests(id);
  }
}
