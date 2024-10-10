import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CharactersModule } from './characters/characters.module';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [CharactersModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
