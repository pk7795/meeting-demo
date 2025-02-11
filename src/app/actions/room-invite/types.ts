import { IsNotEmpty, IsString } from 'class-validator'

export class InviteToRoomInput {
  @IsString()
  @IsNotEmpty()
  passcode!: string

  @IsString()
  @IsNotEmpty()
  email!: string

  @IsString()
  @IsNotEmpty()
  senderName!: string

  @IsString()
  @IsNotEmpty()
  meetingLink!: string

  @IsString()
  @IsNotEmpty()
  accessToken!: string

}
