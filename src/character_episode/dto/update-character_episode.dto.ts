import { PartialType } from '@nestjs/swagger';
import { CreateCharacterEpisodeDto } from './create-character_episode.dto';

export class UpdateCharacterEpisodeDto extends PartialType(CreateCharacterEpisodeDto) {}
