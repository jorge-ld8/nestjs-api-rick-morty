import { BadRequestException, Body, Controller, Delete, Get, NotFoundException, Param, ParseIntPipe, Patch, Query } from '@nestjs/common';
import { CharactersService } from './characters.service';
import { Character } from '@prisma/client';
import { UpdateCharacterDto } from './dto/update-character.dto';
import { CharacterDto } from './dto/character.dto';

@Controller('characters')
export class CharactersController {
    constructor(private charactersService: CharactersService){}

    @Get()
    async getAllCharacters(
        @Query('page') page: number=1, 
        @Query('type') type?: string,
        @Query('species') species?: string,
    ): Promise<{
        info: {
            count: number,
            pages: number,
            next: string | null,
            prev: string | null,
        },
        results: CharacterDto[]
    }> {
        try{
            return await this.charactersService.getAllCharacters(+page, type, species);
        }
        catch(e){
            if(e instanceof BadRequestException){
                throw e;
            }
            console.log(e);
        }
    }

    @Get(':id')
    async getCharacterById(
        @Param('id', ParseIntPipe) id: number
    ): Promise<Character>{
        return await this.charactersService.getCharacterById(id);
    }

    @Patch(':id')
    async updateCharacter(
        @Param('id', ParseIntPipe) id: number, 
        @Body() character: UpdateCharacterDto                    
    ): Promise<CharacterDto>{
        return await this.charactersService.updateCharacter(id, character);
    }

    @Delete(':id')
    async cancelCharacter(
        @Param('id', ParseIntPipe) id: number
    ): Promise<string> {
        try{
            return await this.charactersService.cancelCharacter(id);
        }
        catch (error){
            console.log(error); 
        }
    }
}
