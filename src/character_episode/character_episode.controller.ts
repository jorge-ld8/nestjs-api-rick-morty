import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CharacterEpisodeService } from './character_episode.service';
import { CreateCharacterEpisodeDto } from './dto/create-character_episode.dto';
import { UpdateCharacterEpisodeDto } from './dto/update-character_episode.dto';

@Controller('character-episode')
export class CharacterEpisodeController {
  constructor(private readonly characterEpisodeService: CharacterEpisodeService) {}

  @Post()
  create(@Body() createCharacterEpisodeDto: CreateCharacterEpisodeDto) {
    return this.characterEpisodeService.create(createCharacterEpisodeDto);
  }

  @Get()
  findAll() {
    return this.characterEpisodeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.characterEpisodeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCharacterEpisodeDto: UpdateCharacterEpisodeDto) {
    return this.characterEpisodeService.update(+id, updateCharacterEpisodeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.characterEpisodeService.remove(+id);
  }
}
