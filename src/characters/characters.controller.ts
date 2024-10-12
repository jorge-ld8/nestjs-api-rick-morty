import { BadRequestException, Body, Controller, Delete, Get, NotFoundException, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { CharactersService } from './characters.service';
import { Character } from '@prisma/client';
import { UpdateCharacterDto } from './dto/update-character.dto';
import { CharacterResponse } from '../responses/character_response';
import { ApiQuery, ApiParam, ApiResponse, ApiBody, ApiTags} from '@nestjs/swagger'
import { StandardResponseDto } from 'src/responses/standar_response';
import { SpeciesResponse } from './dto/species.dto';
import { StatusResponse } from './dto/status.dto';
import { CreateCharacterDto } from './dto/create-character.dto';

@ApiTags('Characters')
@Controller('characters')
export class CharactersController {
    constructor(private charactersService: CharactersService){}


    @Get('species')
    async getAllSpecies(): Promise<SpeciesResponse[]>{
        try{
            return await this.charactersService.getAllSpecies();
        }
        catch (error){
            throw error;
        }
    }

    @Get('status')
    async getAllStatus(): Promise<StatusResponse[]>{
        try{
            return await this.charactersService.getAllStatus();
        }
        catch (error){
            throw error;
        }
    }
    
    @Post()
    @ApiBody({ 
        description: 'create character data', 
        type: CreateCharacterDto,
        examples: {
            createCharacterExample: {
                value: {
                    name: "Jorge Leon",
                    type: "",
                    status_id: 1,
                    specie_id: 1,
                }
            }
        }
    })
    @ApiResponse({ status: 200, description: 'Character created successfully.', type: CharacterResponse })
    @ApiResponse({ status: 400, description: 'Character not created.' })
    async createCharacter(
        @Body() character: CreateCharacterDto
    ): Promise<CharacterResponse>{
        try{
            return await this.charactersService.createCharacter(character);
        }
        catch (error){
            throw error;
        }
    }

    @Get()
    @ApiQuery({ name: 'page', required: false, description: 'Page number', type: Number})
    @ApiQuery({ name: 'type', required: false, description: 'Character Type', type: String})
    @ApiQuery({ name: 'species', required: false, description: 'Character Species', type: String, example: "Human"})
    async getAllCharacters(
        @Query('page') page: number=1, 
        @Query('type') type?: string,
        @Query('species') species?: string,
    ): Promise<StandardResponseDto<CharacterResponse>> {
        try{
            return await this.charactersService.getAllCharacters(+page, type, species);
        }
        catch(error){
            throw error;
        }
    }


    @Get(':id')
    @ApiParam({ name: 'id', required: true, description: 'Unique identifier of the character', type: Number, example: 825})
    @ApiResponse({ status: 200, description: 'Character retrieved successfully.', type: CharacterResponse })
    @ApiResponse({ status: 404, description: 'Character not found.' })
    async getCharacterById(
        @Param('id', ParseIntPipe) id: number
    ): Promise<CharacterResponse>{
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
    @ApiResponse({ status: 200, description: 'Character updated successfully.', type: CharacterResponse })
    @ApiResponse({ status: 404, description: 'Character not found.' })
    async updateCharacter(
        @Param('id', ParseIntPipe) id: number, 
        @Body() character: UpdateCharacterDto                    
    ): Promise<CharacterResponse>{
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
