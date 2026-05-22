import { Controller, Get, Request, UseGuards, NotFoundException } from '@nestjs/common';
import { GuestService } from '../guest/guest.service';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';

@UseGuards(FirebaseAuthGuard)
@Controller('session')
export class SessionController {
  constructor(private readonly guestService: GuestService) {}

  // The single boot endpoint the Flutter app calls at startup.
  // Returns everything the client needs to hydrate its state.
  @Get('me')
  getMe(@Request() req: any) {
    const userId = req.user?.id;
    if (!userId) throw new NotFoundException('User identity not found in request context');
    return this.guestService.getSessionMe(userId);
  }
}
