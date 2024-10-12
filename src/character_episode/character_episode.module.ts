import { Module } from '@nestjs/common';
import { CharacterEpisodeService } from './character_episode.service';
import { CharacterEpisodeController } from './character_episode.controller';

@Module({
  controllers: [CharacterEpisodeController],
  providers: [CharacterEpisodeService],
})
export class CharacterEpisodeModule {}
