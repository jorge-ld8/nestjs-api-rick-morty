import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
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
  @ApiQuery({ name: 'characterId', required: false, description: 'Character Id ', type: Number})
  @ApiQuery({ name: 'episodeId', required: false, description: 'Episode Id', type: Number})
  @ApiQuery({ name: 'seasonNum', required: false, description: 'Season #', type: Number})
  async getAllCharacterEpisodes(
    @Query('page') page: number=1,
    @Query('characterId') characterId?: number,
    @Query('episodeId') episodeId?: number,
    @Query('seasonNum') seasonNum?: number
  ): Promise<StandardResponseDto<CharacterEpisodeResponse>> {
    try{
      return await this.characterEpisodeService.getAllCharacterEpisodes(+page, +characterId, +episodeId, +seasonNum);
    }
    catch(error){
      throw error;
    }
  }

  @Patch()
  @ApiBody({ 
    description: 'Update Character Participation Example Data', 
    type: UpdateCharacterEpisodeDto,
    examples: {
        updateCharacterEpisodesExample: {
            value:{
              episode_id: 2,
              character_id: 2,
              times :[
                {
                  start_time: "10:45",
                  end_time: "10:58"
                },
                {
                  start_time: "12:59",
                  end_time: "13:25"
                },
                {
                  start_time: "13:50",
                  end_time: "13:58"
                },
              ]
            }
        }
    }
})
  update(@Body() updateCharacterEpisodeDto: UpdateCharacterEpisodeDto) : Promise<{count: number}> {
    try{
      return this.characterEpisodeService.updateCharacterEpisode(updateCharacterEpisodeDto);
    }
    catch(error){
      throw error;
    }
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
  async deleteCharacterEpisode(@Body() deleteCharacterEpisodeDto: DeleteCharacterEpisodeDto) : Promise<{count: number}> {
    try{
      return await this.characterEpisodeService.deleteCharacterEpisode(deleteCharacterEpisodeDto);
    }
    catch(error){
      throw error;
    }
  }
}
