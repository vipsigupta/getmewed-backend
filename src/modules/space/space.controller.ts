import { Controller, Post, Get, Patch, Body, Param, Request, UseGuards } from '@nestjs/common';
import { SpaceService } from './space.service';
import { CreateSpaceDto, UpdateSpaceStatusDto } from './dto/space.dto';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';

@Controller('spaces')
export class SpaceController {
  constructor(private readonly spaceService: SpaceService) {}

  // Admin creates a new celebration space (wedding, birthday, etc.)
  @Post()
  @UseGuards(FirebaseAuthGuard)
  createSpace(@Body() dto: CreateSpaceDto, @Request() req: any) {
    const userId = req.user.id;
    return this.spaceService.createSpace(userId, dto);
  }

  // Get space details by invite code for mobile onboarding
  @Get('invite/:code')
  getSpaceByInviteCode(@Param('code') code: string) {
    return this.spaceService.getSpaceByInviteCode(code.toUpperCase());
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
