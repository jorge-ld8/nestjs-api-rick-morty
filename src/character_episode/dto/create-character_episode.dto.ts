import { IsNotEmpty, IsString, Matches } from "class-validator";

export class CreateCharacterEpisodeDto {
    @IsNotEmpty()
    character_id: number;

    @IsNotEmpty()
    episode_id: number

    @IsString()
    @Matches(/^[^:]+:[^:]+$/)
    start_time: string;

    @IsString()
    @Matches(/^[^:]+:[^:]+$/)
    end_time: string;
}

// model Character_Episode {
//     character_episode_id Int    @id @default(autoincrement())
//     character_id         Int
//     episode_id           Int
//     start_time           Int
//     end_time             Int
//     Character            Character @relation(fields: [character_id], references: [character_id])
//     Episode              Episode   @relation(fields: [episode_id], references: [episode_id])
//     @@map("characters_episodes")
//   }
  