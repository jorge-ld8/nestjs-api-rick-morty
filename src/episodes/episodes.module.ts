import { Module } from '@nestjs/common';
import { EpisodesService } from './episodes.service';
import { EpisodesController } from './episodes.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [EpisodesController],
  providers: [EpisodesService, PrismaService],
})
export class EpisodesModule {}
