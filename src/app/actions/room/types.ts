import { IsNotEmpty, IsString } from 'class-validator'

export class RoomInput {
  @IsString()
  @IsNotEmpty()
  name!: string
}
