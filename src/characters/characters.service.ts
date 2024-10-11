import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Character } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateCharacterDto } from './dto/update-character.dto';

@Injectable()
export class CharactersService {
    constructor(private readonly prisma: PrismaService){}

    async createCharacter(character: Character) : Promise<Character> {
        return await this.prisma.character.create({data: character});
    }

    async getAllCharacters() : Promise<Character[]>{
        return await this.prisma.character.findMany();
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

    async cancelCharacter(id: number): Promise<Character>{
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

            return character;
        }
        catch(error){
            throw error;
        }
    }
}