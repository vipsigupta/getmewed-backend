import { Global, Module } from '@nestjs/common';
import { FirebaseService } from './firebase.service';

@Global() // Available everywhere without re-importing
@Module({
  providers: [FirebaseService],
  exports: [FirebaseService],
})
export class FirebaseModule {}
