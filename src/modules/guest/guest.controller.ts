import {
  Controller, Post, Get, Patch, Delete,
  Body, Param, NotFoundException, UseGuards, Request,
} from '@nestjs/common';
import { GuestService } from './guest.service';
import { JoinSpaceDto, UpdateParticipationDto } from './dto/participation.dto';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';

@UseGuards(FirebaseAuthGuard)
@Controller('guests')
export class GuestController {
  constructor(private readonly guestService: GuestService) {}

  // ── Onboarding: Guest enters invite code and joins the space ──────

  @Post('join')
  joinSpace(
    @Body() dto: JoinSpaceDto,
    @Request() req: any,
  ) {
    const userId = req.user.id;
    return this.guestService.joinSpace(userId, dto);
  }

  // ── Update guest profile, side, relation, or attendance ───────────

  @Patch(':guestId')
  updateParticipation(
    @Param('guestId') guestId: string,
    @Body() dto: UpdateParticipationDto,
  ) {
    return this.guestService.updateParticipation(guestId, dto);
  }

  // ── Leave a celebration space ──────────────────────────────────────

  @Delete('leave/:spaceId')
  leaveSpace(
    @Param('spaceId') spaceId: string,
    @Request() req: any,
  ) {
    const userId = req.user.id;
    return this.guestService.leaveSpace(userId, spaceId);
  }

  // ── Get a single guest record ──────────────────────────────────────

  @Get(':guestId')
  getGuest(@Param('guestId') guestId: string) {
    return this.guestService.getGuest(guestId);
  }
}
