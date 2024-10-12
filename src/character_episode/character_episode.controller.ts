import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CharacterEpisodeService } from './character_episode.service';
import { CreateCharacterEpisodeDto } from './dto/create-character_episode.dto';
import { UpdateCharacterEpisodeDto } from './dto/update-character_episode.dto';
import { CharacterEpisodeResponse } from './responses/character_episode.entity';
import { ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { StandardResponseDto } from 'src/utils/response-dto';
import { DeleteCharacterEpisodeDto } from './dto/delete-character_episode.dto';

@ApiTags('CharactersEpisodes')
@Controller('character-episode')
export class CharacterEpisodeController {
  constructor(private readonly characterEpisodeService: CharacterEpisodeService) {}

  @Post()
  @ApiBody({ 
    description: 'Create Character Participation Example Data', 
    type: CreateCharacterEpisodeDto,
    examples: {
        createCharacterEpisodesExample: {
            value: {
              episode_id: 2,
              character_id: 2,
              start_time: "10:45",
              end_time: "10:58"
            }
        }
    }
})
  async createCharacterEpisode(@Body() createCharacterEpisodeDto: CreateCharacterEpisodeDto) : Promise<CharacterEpisodeResponse> {
    try{
      return await this.characterEpisodeService.createCharacterEpisode(createCharacterEpisodeDto);
    }
    catch(error){
      throw error;
    }
  }

  @Get()
  @ApiQuery({ name: 'page', required: false, description: 'Page number', type: Number})
  async getAllEpisodes(
    @Query('page') page: number=1
  ): Promise<StandardResponseDto<CharacterEpisodeResponse>> {
    try{
      return await this.characterEpisodeService.getAllCharacterEpisodes(+page);
    }
    catch(error){
      throw error;
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.characterEpisodeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCharacterEpisodeDto: UpdateCharacterEpisodeDto) {
    return this.characterEpisodeService.update(+id, updateCharacterEpisodeDto);
  }

  @Delete()
  @ApiBody({ 
    description: 'Delete Character Participation Example Data', 
    type: DeleteCharacterEpisodeDto,
    examples: {
        deleteCharacterEpisodeExample: {
            value: {
              episode_id: 2,
              character_id: 2,
            }
        }
    }
})
  async deleteCharacterEpisode(@Body() deleteCharacterEpisodeDto: DeleteCharacterEpisodeDto) : Promise<string> {
    try{
      return await this.characterEpisodeService.deleteCharacterEpisode(deleteCharacterEpisodeDto);
    }
    catch(error){
      throw error;
    }
  }
}
