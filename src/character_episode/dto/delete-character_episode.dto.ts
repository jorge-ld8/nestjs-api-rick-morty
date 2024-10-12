import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty } from "class-validator";

export class DeleteCharacterEpisodeDto {
    @IsInt()
    @IsNotEmpty()
    @ApiProperty({description: "Episode ID", example: 2})
    episode_id: number;
  
    @IsInt()
    @IsNotEmpty()
    @ApiProperty({description: "Character ID", example: 2})
    character_id: number;
  }