import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class RoomParticipantInput {
    @IsString()
    @IsOptional()
    name!: string

    @IsString()
    @IsNotEmpty()
    passcode!: string
}
