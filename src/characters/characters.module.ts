import { Module } from '@nestjs/common';
import { CharactersController } from './characters.controller';
import { CharactersService } from './characters.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [CharactersController],
  providers: [CharactersService, PrismaService]
})
export class CharactersModule {}
