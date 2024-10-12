import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCharacterEpisodeDto } from './dto/create-character_episode.dto';
import { UpdateCharacterEpisodeDto } from './dto/update-character_episode.dto';
import { CharacterEpisodeResponse } from './responses/character_episode.entity';
import { PrismaService } from 'src/prisma/prisma.service';
import { Character, Character_Episode, Episode } from '@prisma/client';
import { StandardResponseDto } from 'src/utils/response-dto';
import { DeleteCharacterEpisodeDto} from './dto/delete-character_episode.dto';

@Injectable()
export class CharacterEpisodeService {
  constructor(private readonly prisma: PrismaService){}

  private getSecsFromTime(timeString: string) : number{
    const [mins, secs] = timeString.split(':');
    return (+mins)*60 + (+secs);
  }

  async createCharacterEpisode(data: CreateCharacterEpisodeDto) : Promise<CharacterEpisodeResponse>{
    const secsStart = this.getSecsFromTime(data.start_time);
    const secsEnd = this.getSecsFromTime(data.end_time);

    if (secsStart < 0 || secsEnd > 3600 || secsEnd < secsStart)
      throw new BadRequestException('Time values are not valid.');

    const foundRepeated = await this.prisma.character_Episode.findFirst({
      where:{
        character_id: data.character_id,
        episode_id: data.episode_id,
        OR:[
           {
            start_time: {
               gte: secsStart,
               lte: secsEnd
             }
          },
          {
            end_time: {
              lte: secsEnd,
              gte: secsStart
            }
          }
        ]
      }
    });

    if (foundRepeated)
      throw new BadRequestException('character_episode that overlaps with the current time found');

    const currEpisode = await this.prisma.episode.findUnique({
      where: {
        episode_id: data.episode_id,
        length: {
          lte: secsEnd
        }
      }
    });

    if(!currEpisode)
      throw new NotFoundException("Episode could not be found with the appropriate length");

    const currCharacter = await this.prisma.character.findUnique({
      where:{
        character_id: data.character_id
      }
    });

    if(!currCharacter)
      throw new NotFoundException("Character could not be found.");

    const createdCharEpisode = await this.prisma.character_Episode.create(
      {
        data: {...data,
               start_time: secsStart,
               end_time: secsEnd
        },
        include:{
          Episode: true,
          Character: true,
        }
      }
    )
    return this.CharacterEpisodeToResponse(createdCharEpisode);
  }

  async getAllCharacterEpisodes(page:number) : Promise<StandardResponseDto<CharacterEpisodeResponse>>{
    const pageSize = 5;
    const allCharacterEpisodes = (await this.prisma.character_Episode.findMany({orderBy: {character_episode_id: 'asc'}}));

    if (allCharacterEpisodes.length==0){
        return {
            info:{
                count: 0,
                pages: 0,
                next: null,
                prev: null
            },
            results: []
        };
    }

    let myCursor = allCharacterEpisodes[0].character_episode_id;
    let totalCount = allCharacterEpisodes.length;
    let totalPages = Math.ceil(totalCount / pageSize);
    
    if (page>totalPages || page<1){
        throw new BadRequestException('Page is invalid');
    }

    for (let currPage = 1; currPage <= totalPages; currPage++){
        let character_episodes = await this.prisma.character_Episode.findMany({
                include:{
                    Episode: true,
                    Character: true
                },
                orderBy: {
                    character_episode_id: 'asc'
                },
                take: pageSize,
                cursor: {
                    character_episode_id: myCursor,
                }
            }
        );
        if (currPage === page){
            return {
                info: {
                    count: totalCount,
                    pages: totalPages,
                    prev: page > 1 ? `/character_episodes?page=${page-1}` : null,
                    next: page < totalPages ? `/character_episodes?page=${page+1}` : null,
                },
                results: character_episodes.map((character_episode)=>this.CharacterEpisodeToResponse(character_episode))
            }
        }
        myCursor = character_episodes[pageSize-1].character_id + 1;
    }
}
  findOne(id: number) {
    return `This action returns a #${id} characterEpisode`;
  }

  update(id: number, updateCharacterEpisodeDto: UpdateCharacterEpisodeDto) {
    return `This action updates a #${id} characterEpisode`;
  }

  async deleteCharacterEpisode(data: DeleteCharacterEpisodeDto) : Promise<string>{
    const deleted = await this.prisma.character_Episode.deleteMany({
      where:{
        character_id: data.character_id,
        episode_id: data.episode_id
      }
    });

    if (deleted.count==0)
      return 'No records deleted';

    return 'Delete performed succesfully';
  }

  private CharacterEpisodeToResponse(data: Character_Episode & {Character: Character, Episode: Episode}) : CharacterEpisodeResponse {
    return {
        character_episode_id: data.character_episode_id,
        character: data.Character.name,
        episode: data.Episode.episode_code,
        start_time: `${(Math.floor(data.start_time/60)+"").padStart(2, '0')}:${(data.start_time%60+"").padStart(2, '0')}`,
        end_time: `${(Math.floor(data.end_time/60)+"").padStart(2, '0')}:${(data.end_time%60+"").padStart(2, '0')}`
    };
}
}

// export class CharacterEpisodeResponse{
//   character_episode_id: number;

//   character: string;
  
//   episode: string;
  
//   start_time: string;
  
//   end_time: string;
// }
