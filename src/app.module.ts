import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CharactersModule } from './characters/characters.module';
import { PrismaService } from './prisma/prisma.service';
import { EpisodesModule } from './episodes/episodes.module';

@Module({
  imports: [CharactersModule, EpisodesModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
