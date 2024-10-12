import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { EpisodesService } from './episodes.service';
import { CreateEpisodeDto } from './dto/create-episode.dto';
import { UpdateEpisodeDto } from './dto/update-episode.dto';
import { StandardResponseDto } from 'src/utils/response-dto';
import { EpisodeDto } from './dto/episode.dto';
import { ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';

// export class CreateEpisodeDto {
//   @IsNotEmpty()
//   @IsString()
//   name: string;

//   @IsNotEmpty()
//   @IsInt()
//   length: number;

//   @IsNotEmpty()
//   @IsDate()
//   airDate: Date;
  
//   @IsNotEmpty()
//   @IsInt()
//   season

@ApiTags('Episodes')
@Controller('episodes')
export class EpisodesController {
  constructor(private readonly episodesService: EpisodesService) {}

  @Post()
  @ApiBody({ 
    description: 'Create Episode Example Data', 
    type: CreateEpisodeDto,
    examples: {
        createEpisodeExample: {
            value: {
                name: "Battle of the Bastards",
                length: 55,
                airDate: '2014-01-01',
                season_id: 11,
            }
        }
    }
})
  async createEpisode(@Body() createEpisodeDto: CreateEpisodeDto) {
    return await this.episodesService.createEpisode(createEpisodeDto);
  }
  
  @Get('/season/:seasonNumber')
  async getEpisodesBySeason(
    @Param('seasonNumber', ParseIntPipe) seasonNumber: number
  ): Promise<EpisodeDto[]>{
    try{
      return await this.episodesService.getEpisodesBySeason(seasonNumber);
    }
    catch(error){
      throw error;
    }
  }

  @Get()
  @ApiQuery({ name: 'page', required: false, description: 'Page number', type: Number})
  async getAllEpisodes(
    @Query('page') page: number=1
  ): Promise<StandardResponseDto<EpisodeDto>> {
    try{
      return await this.episodesService.getAllEpisodes(+page);
    }
    catch(error){
      throw error;
    }
  }


  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.episodesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEpisodeDto: UpdateEpisodeDto) {
    return this.episodesService.update(+id, updateEpisodeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.episodesService.remove(+id);
  }
}
