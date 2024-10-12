import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CharactersModule } from './characters/characters.module';
import { PrismaService } from './prisma/prisma.service';
import { EpisodesModule } from './episodes/episodes.module';
import { CharacterEpisodeModule } from './character_episode/character_episode.module';

@Module({
  imports: [CharactersModule, EpisodesModule, CharacterEpisodeModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
