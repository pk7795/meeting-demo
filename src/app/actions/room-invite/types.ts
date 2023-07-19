import { IsNotEmpty, IsString } from 'class-validator'

export class InviteToRoomInput {
  @IsString()
  @IsNotEmpty()
  passcode!: string

  @IsString()
  @IsNotEmpty()
  email!: string
}
