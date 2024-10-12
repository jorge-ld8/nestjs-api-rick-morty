import { Module } from '@nestjs/common';
import { CharacterEpisodeService } from './character_episode.service';
import { CharacterEpisodeController } from './character_episode.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [CharacterEpisodeController],
  providers: [CharacterEpisodeService, PrismaService],
})
export class CharacterEpisodeModule {}
