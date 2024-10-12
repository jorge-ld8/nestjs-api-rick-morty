import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Character, Status, Subcategory } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateCharacterDto } from './dto/update-character.dto';
import { CharacterResponse } from '../responses/character_response';
import { SpeciesResponse } from './dto/species.dto';
import { StatusResponse } from './dto/status.dto';
import { CreateCharacterDto } from './dto/create-character.dto';
import { StandardResponseDto } from 'src/responses/standar_response';

@Injectable()
export class CharactersService {
    constructor(private readonly prisma: PrismaService){}

    async createCharacter(data: CreateCharacterDto) : Promise<CharacterResponse> {
        const characterRepeated = data.type.length ?  await this.prisma.character.findFirst(
            {
                where: {
                    type: data.type,
                    Specie:{
                        subcategory_id: data.specie_id
                    },
                    name: data.name,
                    Status: {
                        value: {
                            not:{
                                equals: "Suspended"
                            }
                        }
                    }
                }
            }
        ) : null

        if (characterRepeated) throw new BadRequestException('Character names with the same species and type cannot be repeated');

        const character = await this.prisma.character.create(
            {data, include: {
                Specie: true,
                Status: true
            }},
        );
        return this.CharacterToResponse(character);
    }

    async getAllCharacters(page:number, type?: string, species?: string) : Promise<StandardResponseDto<CharacterResponse>>{
        const pageSize = 5;
        const allCharacters = (await this.prisma.character.findMany({
            where: {
                type: type,
                Specie:{
                    name: species
                },
                Status: {
                    value: {
                        not:{
                            equals: "Suspended"
                        }
                    }
                }
            },
            orderBy: {character_id: 'asc'}}));

        if (allCharacters.length==0){
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

        let myCursor = allCharacters[0].character_id;
        let totalCount = allCharacters.length;
        let totalPages = Math.ceil(totalCount / pageSize);
        
        if (page>totalPages || page<1){
            throw new BadRequestException('Page is invalid');
        }

        for (let currPage = 1; currPage <= totalPages; currPage++){
            let characters = await this.prisma.character.findMany({
                    where: {
                            type: type,
                            Specie:{
                                name: species
                            },
                            Status: {
                                value: {
                                    not:{
                                        equals: "Suspended"
                                    }
                                }
                            }
                    },
                    include:{
                        Specie: true,
                        Status: true
                    },
                    orderBy: {
                        character_id: 'asc'
                    },
                    take: pageSize,
                    cursor: {
                        character_id: myCursor,
                    }
                }
            );
            if (currPage === page){
                return {
                    info: {
                        count: totalCount,
                        pages: totalPages,
                        prev: page > 1 ? `/characters?page=${page-1}${species ? "&species="+species:''}${type ? "&type="+type:''}` : null,
                        next: page < totalPages ? `/characters?page=${page+1}${species ? "&species="+species:''}${type ? "&type="+type:''}` : null,
                    },
                    results: characters.map((character)=>this.CharacterToResponse(character))
                }
            }
            myCursor = characters[pageSize-1].character_id + 1;
        }
    }

    async getCharacterById(id: number): Promise<CharacterResponse> {
        const character = await this.prisma.character.findUnique({
            where: {
                character_id : id,
                Status: {
                    value: {
                        not:{
                            equals: "Suspended"
                        }
                    }
                }
            },
            include: {
                Status: true,
                Specie: true
            }
        });
        
        if (!character) throw new NotFoundException('Character not found.')

        return this.CharacterToResponse(character);
    }

    async updateCharacter(id: number, character: UpdateCharacterDto): Promise<CharacterResponse>{
        if (character.status_id){
            const status = await this.prisma.status.findUnique({
                where: {
                        status_id: character.status_id,
                        status_type: {
                            value: "Character"
                        },
                },
            });

            if (!status) throw new BadRequestException('Status not found');
        }

        if (character.specie_id){
            const species = await this.prisma.subcategory.findUnique({
                where:{
                        subcategory_id: character.specie_id,
                        category: {
                            name: "Species"
                        }
                }
            });
    
            if (!species) throw new BadRequestException('Species not found');
        }

        const characterRepeated = (character.type.length && character.specie_id && character.name) ?  
            await this.prisma.character.findFirst(
            {
                where: {
                    type: character.type,
                    Specie:{
                        subcategory_id: character.specie_id
                    },
                    name: character.name,
                    character_id: {
                        not:{
                            equals: id
                        }
                    }
                }
            }
        ) : null

        if (characterRepeated) throw new BadRequestException('Character names with the same species and type cannot be repeated');

        let updated = await this.prisma.character.update({
            where: {
                character_id: id,
                Status: {
                    value: {
                        not:{
                            equals: "Suspended"
                        }
                    }
                }
            },
            data: character,
            include: {
                Status: true,
                Specie: true
            }
        })

        if (!updated) throw new BadRequestException(`Character with id: ${id} not found hence it couldn't be updated`);

        return this.CharacterToResponse(updated);
    }

    async cancelCharacter(id: number): Promise<string>{
        try {
            const statusTypeCharacterId = (await this.prisma.status_Type.findFirst({where: {value: "Character"}})).status_type_id;

            if (!statusTypeCharacterId) throw new BadRequestException("Status Character 'Suspended' not found");

            const character = await this.prisma.character.update({
                where: {
                    character_id: id,
                    Status: {
                        value: {
                            not:{
                                equals: "Suspended"
                            }
                        }
                    }
                },
                data:{
                    status_id : (await this.prisma.status.findFirst({where: {
                                                                            value: "Suspended", 
                                                                            status_type_id: statusTypeCharacterId,
                                                                        }})).status_id
                }
            })

            if (!character) 
                return `Character not found.`;

            return 'Character has been succesfully suspended';
        }
        catch(error){
            throw error;
        }
    }

    async getAllSpecies(): Promise<SpeciesResponse[]>{
        const speciesList =  await this.prisma.subcategory.findMany({
            where:{
                category: {
                    name: "Species",
                }
            },
            select:{
                subcategory_id: true,
                name: true
            }
        });

        if (speciesList.length==0) throw new NotFoundException('Species not found.')

        return speciesList.map((species)=>(
            {
                id: species.subcategory_id,
                name: species.name
            }
        ));
    }

    async getAllStatus(): Promise<StatusResponse[]>{
        const statusList = await this.prisma.status.findMany({
            where:{
                status_type: {
                    value: "Character"
                }
            },
            select:{
                status_id: true,
                value: true
            }
        });

        if (statusList.length==0) throw new NotFoundException('Status not found.')

        return statusList.map((status)=>(
            {
                id: status.status_id,
                value: status.value
            }
        ));
    }

    private CharacterToResponse(character: Character & {Specie: Subcategory, Status: Status}) : CharacterResponse {
        return {
            id :character.character_id,
            name: character.name,
            type: character.type,
            status: character.Status.value,
            species: character.Specie.name
        }
    }
}