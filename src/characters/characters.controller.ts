import { BadRequestException, Body, Controller, Delete, Get, NotFoundException, Param, ParseIntPipe, Patch, Query } from '@nestjs/common';
import { CharactersService } from './characters.service';
import { Character } from '@prisma/client';
import { UpdateCharacterDto } from './dto/update-character.dto';
import { CharacterDto } from './dto/character.dto';
import { ApiQuery, ApiParam, ApiResponse, ApiBody} from '@nestjs/swagger'
import { StandardResponseDto } from 'src/utils/response-dto';

@Controller('characters')
export class CharactersController {
    constructor(private charactersService: CharactersService){}

    @Get()
    @ApiQuery({ name: 'page', required: false, description: 'Page number', type: Number})
    @ApiQuery({ name: 'type', required: false, description: 'Character Type', type: String})
    @ApiQuery({ name: 'species', required: false, description: 'Character Species', type: String, example: "Human"})
    async getAllCharacters(
        @Query('page') page: number=1, 
        @Query('type',) type?: string,
        @Query('species') species?: string,
    ): Promise<StandardResponseDto<CharacterDto>> {
        try{
            return await this.charactersService.getAllCharacters(+page, type, species);
        }
        catch(error){
            throw error;
        }
    }


    @Get(':id')
    @ApiParam({ name: 'id', required: true, description: 'Unique identifier of the character', type: Number, example: 825})
    @ApiResponse({ status: 200, description: 'Character retrieved successfully.', type: CharacterDto })
    @ApiResponse({ status: 404, description: 'Character not found.' })
    async getCharacterById(
        @Param('id', ParseIntPipe) id: number
    ): Promise<CharacterDto>{
        try{
            return await this.charactersService.getCharacterById(id);
        }
        catch(error){
            throw error;
        }
    }


    @Patch(':id')
    @ApiParam({ name: 'id', required: true, description: 'Unique identifier of the character', type: Number, example: 825})
    @ApiBody({
        description: 'Update character data',
        type: UpdateCharacterDto,
        examples: {
            updateCharacterExample: {
                value: {
                    name: 'Pedro Lopez',
                    type: 'Human',
                    specie_id: 1,
                    status_id: 1
                },
            },
        },
    })
    @ApiResponse({ status: 200, description: 'Character updated successfully.', type: CharacterDto })
    @ApiResponse({ status: 404, description: 'Character not found.' })
    async updateCharacter(
        @Param('id', ParseIntPipe) id: number, 
        @Body() character: UpdateCharacterDto                    
    ): Promise<CharacterDto>{
        return await this.charactersService.updateCharacter(id, character);
    }


    @Delete(':id')
    @ApiParam({ name: 'id', required: true, description: 'Unique identifier of the character', type: Number})
    @ApiResponse({ status: 200, description: 'Character deleted successfully.' })
    @ApiResponse({ status: 404, description: 'Character not found.' })
    async cancelCharacter(
        @Param('id', ParseIntPipe) id: number
    ): Promise<string> {
        try{
            return await this.charactersService.cancelCharacter(id);
        }
        catch (error){
            throw error;
        }
    }
}
