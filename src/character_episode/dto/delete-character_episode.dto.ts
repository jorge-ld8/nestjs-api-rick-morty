import { IsInt, IsNotEmpty } from "class-validator";

export class DeleteCharacterEpisodeDto {
    @IsInt()
    @IsNotEmpty()
    episode_id: number;
  
    @IsInt()
    @IsNotEmpty()
    character_id: number;
  }