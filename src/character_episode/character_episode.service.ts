import { BadRequestException, HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCharacterEpisodeDto } from './dto/create-character_episode.dto';
import { EpisodeTime, UpdateCharacterEpisodeDto } from './dto/update-character_episode.dto';
import { CharacterEpisodeResponse } from '../responses/character_episode_response';
import { PrismaService } from 'src/prisma/prisma.service';
import { Character, Character_Episode, Episode } from '@prisma/client';
import { StandardResponseDto } from 'src/responses/standar_response';
import { DeleteCharacterEpisodeDto} from './dto/delete-character_episode.dto';

@Injectable()
export class CharacterEpisodeService {
  constructor(private readonly prisma: PrismaService){}

  private getSecsFromTime(timeString: string) : number{
    const [mins, secs] = timeString.split(':');
    return (+mins)*60 + (+secs);
  }

  private invalidTime(time: EpisodeTime) : boolean{
    const secsStart = this.getSecsFromTime(time.start_time);
    const secsEnd = this.getSecsFromTime(time.end_time);
    return secsStart < 0 || secsEnd > 3600 || secsEnd < secsStart;
  }

  async createCharacterEpisode(data: CreateCharacterEpisodeDto) : Promise<CharacterEpisodeResponse>{
    const secsStart = this.getSecsFromTime(data.start_time);
    const secsEnd = this.getSecsFromTime(data.end_time);

    if (this.invalidTime({start_time: data.start_time, end_time: data.end_time}))
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

  async getAllCharacterEpisodes(page:number, 
                               characterId?:number, 
                               episodeId?:number,
                               seasonNum?:number) : Promise<StandardResponseDto<CharacterEpisodeResponse>>{
    const pageSize = 5;
    const allCharacterEpisodes = (await this.prisma.character_Episode.findMany({
      where:{
        ...(characterId ? { character_id: characterId } : {}),
        ...(episodeId ? { episode_id: episodeId } : {}),
        Episode:{
          Season:{
            name: {
              endsWith: seasonNum ? (seasonNum + "").padStart(2, '0') : undefined
            }
          }
        }
      },
      orderBy: {character_episode_id: 'asc'}}));

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
                where:{
                  ...(characterId ? { character_id: characterId } : {}),
                  ...(episodeId ? { episode_id: episodeId } : {}),
                  Episode:{
                    Season:{
                      name: {
                        endsWith: seasonNum ? (seasonNum + "").padStart(2, '0') : undefined
                      }
                    }
                  }
                },
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
            let urlGen = (inputPage: number) => (`/character_episodes?page=${inputPage}${characterId ? "&character_id="+characterId:""}${episodeId ? "&episode_id="+episodeId:""}${seasonNum ? "&seasonNum="+seasonNum:""}`);
            return {
                info: {
                    count: totalCount,
                    pages: totalPages,
                    prev: page > 1 ? urlGen(page-1) : null,
                    next: page < totalPages ? urlGen(page+1) : null,
                },
                results: character_episodes.map((character_episode)=>this.CharacterEpisodeToResponse(character_episode))
            }
        }
        myCursor = character_episodes[pageSize-1].character_episode_id + 1;
    }
}
  findOne(id: number) {
    return `This action returns a #${id} characterEpisode`;
  }

  private async checkCharacterEpisodeParticipation(createCharacterEpisode: CreateCharacterEpisodeDto) : Promise<number>{
      const characterEpisode = await this.prisma.character_Episode.findFirst({
        where: {
          character_id: createCharacterEpisode.character_id,
          episode_id: createCharacterEpisode.episode_id,
          OR:[
             {
              start_time: {
                 gte: this.getSecsFromTime(createCharacterEpisode.start_time),
                 lte: this.getSecsFromTime(createCharacterEpisode.end_time),
               }
            },
            {
              end_time: {
                lte: this.getSecsFromTime(createCharacterEpisode.end_time),
                gte: this.getSecsFromTime(createCharacterEpisode.start_time),
              }
            }
          ]
        }
      })

      return characterEpisode ? characterEpisode.character_episode_id : undefined;
  }

  async updateCharacterEpisode(updateCharacterEpisodeDto: UpdateCharacterEpisodeDto) : Promise<{count: number}> {
    const characterEpisode = await this.prisma.character_Episode.findFirst({
      where:{
        episode_id: updateCharacterEpisodeDto.episode_id,
        character_id: updateCharacterEpisodeDto.character_id
      },
      include:{
        Episode: true
      }
    });

    if (!characterEpisode)
      throw new NotFoundException('Character has no current participation on episode');

    let count = 0;

    for (let epTime of updateCharacterEpisodeDto.times){
      try{
        let secsStart = this.getSecsFromTime(epTime.start_time);
        let secsEnd = this.getSecsFromTime(epTime.end_time);

        if (this.invalidTime(epTime))
          throw new BadRequestException('There are one or more no valid times.');

        if (secsEnd > characterEpisode.Episode.length)
          throw new BadRequestException('There is a time greater than episode length')

        const character_episode_id = await this.checkCharacterEpisodeParticipation({
                                          character_id: updateCharacterEpisodeDto.character_id,
                                          episode_id: updateCharacterEpisodeDto.episode_id,
                                          start_time: epTime.start_time,
                                          end_time: epTime.end_time
                                        });

        //remove all ocurrences that fall into that interval
        await this.prisma.character_Episode.deleteMany({
          where: {
            OR:[
              {
               start_time: {
                  gte: secsStart,
                  lte: secsEnd,
                }
             },
             {
               end_time: {
                 lte: secsEnd,
                 gte: secsStart,
               }
             }
           ],
           character_episode_id:{
            not:{
              equals: character_episode_id
            }
           }
          }
        });

        // Insert or Update the current episode
        await this.prisma.character_Episode.upsert({
          where: {
            character_episode_id: character_episode_id ?? 0,
            episode_id: updateCharacterEpisodeDto.episode_id,
            character_id: updateCharacterEpisodeDto.character_id
          },
          update:{
            start_time: secsStart,
            end_time: secsEnd,
          },
          create:{
            character_id: updateCharacterEpisodeDto.character_id,
            episode_id: updateCharacterEpisodeDto.episode_id,
            start_time: secsStart,
            end_time: secsEnd,
          }
        });



        count++;
      }
    catch(error){
      if (error instanceof HttpException){
        console.log(error.message)
      }
      else{
        console.log(error);
      }
    }
    };
    return {count: count}
  }

  async deleteCharacterEpisode(data: DeleteCharacterEpisodeDto) : Promise<{count: number}>{
    const deleted = await this.prisma.character_Episode.deleteMany({
      where:{
        character_id: data.character_id,
        episode_id: data.episode_id
      }
    });
    return deleted;
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
