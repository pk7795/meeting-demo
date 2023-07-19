import { IsNotEmpty, IsString } from 'class-validator'

export class MessageInput {
  @IsString()
  @IsNotEmpty()
  content!: string

  @IsString()
  @IsNotEmpty()
  roomId!: string
}
