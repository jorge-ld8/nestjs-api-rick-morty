import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateEpisodeDto } from './dto/create-episode.dto';
import { UpdateEpisodeDto } from './dto/update-episode.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Episode, Status, Subcategory } from '@prisma/client';
import { EpisodeResponse } from '../responses/episode_response';
import { StandardResponseDto } from 'src/responses/standar_response';

@Injectable()
export class EpisodesService {
  constructor(private readonly prisma: PrismaService){}
  private async getEpisodeNumberForSeason(seasonNum: number){
    let currSeasonEpisode = +(await this.prisma.episode.findFirst({
      where: {
        Season:{
          name: {
            contains: (seasonNum + "").padStart(2, '0')
          },
        },
        Status:{
          value: { not: {
              equals: 'Cancelled'
            }
          }
        }
      },
      orderBy:{
        episode_code: 'desc'
      }
    })).episode_code.slice(-2);

    return currSeasonEpisode + 1;
  }

  async createEpisode(createEpisodeDto: CreateEpisodeDto) : Promise<EpisodeResponse>{
    const currSeasonNum = (await this.prisma.subcategory.findFirst(
      {
        where: {
          name: {
            endsWith: (createEpisodeDto.seasonNum+"").padStart(2, '0')
          },
          category:{
            name: "Season"
          }
        },
      }
    ))?.name.slice(-2);

    if(!currSeasonNum) new BadRequestException('Season Not Found.');

    const episodeRepeated = await this.prisma.episode.findFirst(
                {
                    where: {
                      name: createEpisodeDto.name,
                      Season: {
                        name: {
                          endsWith: (createEpisodeDto.seasonNum+"").padStart(2, '0')
                        },
                      },
                      Status:{
                        value: {
                          not: {
                            equals: 'Cancelled'
                          }
                        }
                      }
                    },
                    include:{
                      Season: true,
                      Status: true
                    }
                });

    if (episodeRepeated) throw new BadRequestException('There is already an episode with the same name in the same season');

    const currentDate = new Date(createEpisodeDto.airDate);
    currentDate.setHours(currentDate.getHours() + 6);
    const episode = await this.prisma.episode.create({
      data: {name: createEpisodeDto.name,
            length: createEpisodeDto.length,
            season_id: (await this.prisma.subcategory.findFirst({ where: {name:{endsWith: (createEpisodeDto.seasonNum+"").padStart(2, '0')}}})).subcategory_id,
            airDate: currentDate,
            episode_code: `S${currSeasonNum.padStart(2, '0')}E${((await this.getEpisodeNumberForSeason(+currSeasonNum))+"").padStart(2, '0')}`,
            status_id: (await this.prisma.status.findFirst({ where:{value: "Active", status_type: {value: 'Episode'}},}))?.status_id ?? 1
          },
      include:{
        Season: true,
        Status: true
      }
    })

    return this.EpisodeToResponse(episode);
  }

  async getAllEpisodes(page:number=1) : Promise<StandardResponseDto<EpisodeResponse>>{
    const pageSize = 5;
    const allEpisodes = await this.prisma.episode.findMany({
      where: {
        Status:{
            value: {
              not: {
                equals: 'Cancelled'
              }
            }
          }
      },
      orderBy: 
      {
        episode_id: 'asc'
      }
    });

    if (allEpisodes.length==0){
        return {
            info:{
                count: 0,
                pages: 0,
                prev: null,
                next: null,
            },
            results: []
        };
    }

    let myCursor = allEpisodes[0].episode_id;
    let totalCount = allEpisodes.length;
    let totalPages = Math.ceil(totalCount / pageSize);
    
    if (page>totalPages || page<1){
        throw new BadRequestException('Page is invalid');
    }

    for (let currPage = 1; currPage <= totalPages; currPage++){
        let episodes = await this.prisma.episode.findMany({
                where: {
                  Status:{
                      value: {
                        not: {
                          equals: 'Cancelled'
                        }
                      }
                    }
                },
                include:{
                    Season: true,
                    Status: true
                },
                orderBy: {
                    episode_id: 'asc',
                },
                take: pageSize,
                cursor: {
                    episode_id: myCursor,
                }
            }
        );
        if (currPage === page){
            return {
                info: {
                    count: totalCount,
                    pages: totalPages,
                    prev: page > 1 ? `/episodes?page=${page-1}` : null,
                    next: page < totalPages ? `/episodes?page=${page+1}` : null,
                },
                results: episodes.map((episode)=>this.EpisodeToResponse(episode))
            }
        }
        myCursor = episodes[pageSize-1].episode_id + 1;
    }
  }

  async getEpisodesBySeason(seasonNum: number) : Promise<EpisodeResponse[]>{
    const episodes = await this.prisma.episode.findMany({
      where:{
        Season:{
          name: {
            endsWith: (seasonNum + "").padStart(2, '0'),
          },
          category:{
            name: "Season"
          }
        },
        Status:{
          value: { not: {
              equals: 'Cancelled'
            }
          }
        }
      },
      include:{
        Season: true,
        Status: true
      },
      orderBy:{
        episode_id: 'asc'
      }
    });

    if (episodes.length == 0) throw new NotFoundException('Season Does Not Exist');

    return episodes.map((episode)=>(this.EpisodeToResponse(episode)))
  }

  findOne(id: number) {
    return `This action returns a #${id} episode`;
  }

  async updateEpisode(id: number, updateEpisodeDto: UpdateEpisodeDto) : Promise<EpisodeResponse> {
    if (updateEpisodeDto.seasonNum){
        const season = await this.prisma.subcategory.findFirst({
            where:{
                  name: {
                    endsWith: (updateEpisodeDto.seasonNum+"").padStart(2, '0')
                  },
                    category: {
                        name: "Season"
                    }
            }
        });

        if (!season) throw new BadRequestException('Season not found');
    }

    const episodeRepeated = await this.prisma.episode.findFirst(
                {
                    where: {
                      name: updateEpisodeDto.name,
                      Season: {
                        name: {
                          endsWith: (updateEpisodeDto.seasonNum+"").padStart(2, '0')
                        },
                      },
                      Status:{
                        value: {
                          not: {
                            equals: 'Cancelled'
                          }
                        }
                      }
                    },
                    include:{
                      Season: true,
                      Status: true
                    }
                });

    if (episodeRepeated) throw new BadRequestException('There is already an episode with the same name in the same season');
    
    const currentDate = new Date(updateEpisodeDto.airDate);
    currentDate.setHours(currentDate.getHours() + 6);

    let updated = await this.prisma.episode.update({
        where: {
            episode_id: id,
            Status:{
              value: {
                not: {
                  equals: 'Cancelled'
                }
              }
            }
        },
        data: {...updateEpisodeDto, airDate:currentDate},
        include: {
            Status: true,
            Season: true
        }
    })

    if (!updated) throw new  BadRequestException(`Episode with id: ${id} not found hence it couldn't be updated`);

    return this.EpisodeToResponse(updated);
  }


  async getEpisodeById(id: number) : Promise<EpisodeResponse>{
    const episode = await this.prisma.episode.findUnique({
      where: {
          episode_id : id
      },
      include: {
          Status: true,
          Season: true
      }
    });
    
    if (!episode) throw new NotFoundException('Episode not found.')

    return this.EpisodeToResponse(episode);
  }

  async cancelEpisode(id: number) : Promise<string>{
    try {
      const statusTypeEpisodeId = (await this.prisma.status_Type.findFirst({where: {value: "Episode"}})).status_type_id;

      if (!statusTypeEpisodeId){
          throw new BadRequestException("Status Episode 'Cancelled' not found");
      }

      const episode = await this.prisma.episode.update({
          where: {
              episode_id: id,
              Status:{
                value: { not: {
                    equals: 'Cancelled'
                  }
                }
              }
          },
          data:{
              status_id : (await this.prisma.status.findFirst({where: {value: "Cancelled", status_type_id: statusTypeEpisodeId}})).status_id
          }
      })

      if (!episode)
          return `Episode not found.`;

      return 'Episode has been succesfully cancelled';
    } 
    catch(error){
        throw error;
    }
  }

  private EpisodeToResponse(episode: Episode & {Season: Subcategory, Status: Status}) : EpisodeResponse {
    return {
        id: episode.episode_id,
        name: episode.name,
        length: `${(Math.floor(episode.length / 60)+"").padStart(2, '0')}:${((episode.length % 60)+"").padStart(2, '0')}`,
        airDate: episode.airDate.toDateString(),
        episode_code: episode.episode_code,
        status: episode.Status.value,
        season: episode.Season.name
    };
}
}
