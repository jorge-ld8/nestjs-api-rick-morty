import { PartialType } from '@nestjs/swagger';
import { CreateCharacterEpisodeDto } from './create-character_episode.dto';
import { Matches } from 'class-validator';

export class EpisodeTime{
    @Matches(/^[^:]+:[^:]+$/)
    start_time: string;

    @Matches(/^[^:]+:[^:]+$/)
    end_time: string;
}

export class UpdateCharacterEpisodeDto extends PartialType(CreateCharacterEpisodeDto) {
    character_id: number;

    episode_id: number

    times: EpisodeTime[]
}
