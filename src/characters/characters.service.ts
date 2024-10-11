import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Character } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateCharacterDto } from './dto/update-character.dto';
import { CharacterDto } from './dto/character.dto';
import { equal } from 'assert';
import { all } from 'axios';

@Injectable()
export class CharactersService {
    constructor(private readonly prisma: PrismaService){}

    async createCharacter(character: Character) : Promise<Character> {
        return await this.prisma.character.create({data: character});
    }

    async getAllCharacters(page:number, type?: string, species?: string) : Promise<{
        info: {
            count: number,
            pages: number,
            next: string | null,
            prev: string | null,
        },
        results: CharacterDto[]
    }>{
        // curr page size can be changed
        const pageSize = 5;
        const allCharacters = (await this.prisma.character.findMany({where: {
            AND:[
                {type},
                {Specie:{
                    name: species
                }}
            ]
        },orderBy: {character_id: 'asc'}}));

        if (!allCharacters){
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
                        AND:[
                            {type},
                            {Specie:{
                                name: species
                            }}
                        ]
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
                        next: page < totalPages ? `/characters?page=${page+1}${species ? "&species="+species:''}${type ? "&type="+type:''}` : null,
                        prev: page > 1 ? `/characters?page=${page-1}${species ? "&species="+species:''}${type ? "&type="+type:''}` : null
                    },
                    results: characters.map((character)=>(
                        {
                            id: character.character_id, 
                            name: character.name,
                            status: character.Status.value,
                            species: character.Specie.name,
                            type: character.type
                        }))
                }
            }
            myCursor = characters[pageSize-1].character_id + 1;
        }
    }

    async getCharacterById(id: number): Promise<Character> {
        return await this.prisma.character.findFirstOrThrow({
            where: {
                character_id : id
            }
        });
    }

    async updateCharacter(id: number, character: UpdateCharacterDto): Promise<Character>{
        return await this.prisma.character.update({
            where:{
                character_id: id
            },
            data: {...character}
        });
    }

    async cancelCharacter(id: number): Promise<string>{
        try {
            const statusTypeCharacterId = (await this.prisma.status_Type.findFirst({where: {value: "Character"}})).status_type_id;

            if (!statusTypeCharacterId){
                throw new BadRequestException('Status Character Cancelled not found');
            }

            const character = await this.prisma.character.update({
                where: {
                    character_id: id
                },
                data:{
                    status_id : (await this.prisma.status.findFirst({where: {AND: [{value: "Cancelled"}, {status_type_id: statusTypeCharacterId}]}})).status_id
                }
            })

            if (!character){
                throw new NotFoundException(`Record with id: ${id} not found`);
            }

            return 'Character has been succesfully suspended';
        }
        catch(error){
            throw error;
        }
    }
}