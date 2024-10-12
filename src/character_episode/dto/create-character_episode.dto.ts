import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, Matches } from "class-validator";

export class CreateCharacterEpisodeDto {
    @IsNotEmpty()
    @ApiProperty({description: "Character ID", example: 2})
    character_id: number;

    @IsNotEmpty()
    @ApiProperty({description: "Episode ID", example: 2})
    episode_id: number

    @IsString()
    @Matches(/^[^:]+:[^:]+$/)
    @ApiProperty({description: "Appearence start time", example: "11:50"})
    start_time: string;

    @IsString()
    @Matches(/^[^:]+:[^:]+$/)
    @ApiProperty({description: "Appearence end time", example: "13:05"})
    end_time: string;
}