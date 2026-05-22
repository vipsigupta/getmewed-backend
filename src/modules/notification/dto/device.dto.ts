import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class RegisterDeviceDto {
  @IsString()
  @IsNotEmpty()
  token: string; // FCM or APNS token

  @IsString()
  @IsOptional()
  deviceType?: string; // "iOS" | "Android"

  @IsUUID()
  @IsNotEmpty()
  guestId: string; // Which guest participation this device is registered under
}

export class RemoveDeviceDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}
