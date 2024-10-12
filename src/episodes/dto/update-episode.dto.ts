import { PartialType } from '@nestjs/swagger';
import { CreateEpisodeDto } from './create-episode.dto';

export class UpdateEpisodeDto extends PartialType(CreateEpisodeDto) {

    name?: string;

    length?: number;

    airDate?: string;

    season_id?: number;
}
