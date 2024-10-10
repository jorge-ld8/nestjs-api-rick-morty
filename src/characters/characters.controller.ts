import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { CharactersService } from './characters.service';
import { Character } from '@prisma/client';
import { UpdateCharacterDto } from './dto/update-character.dto';
import { CharacterDto } from './dto/character.dto';

@Controller('characters')
export class CharactersController {
    constructor(private charactersService: CharactersService){}

    @Get()
    async getAllCharacters(): Promise<Character[]> {
        return await this.charactersService.getAllCharacters();
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
    ): Promise<Character>{
        return await this.charactersService.updateCharacter(id, character);
    }

    @Delete(':id')
    async cancelCharacter(
        @Param('id', ParseIntPipe) id: number
    ): Promise<Character> {
        return await this.charactersService.cancelCharacter(id);
    }

}
