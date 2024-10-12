import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsDateString, IsISO8601, IsInt, IsNotEmpty, IsString } from "class-validator";

export class CreateEpisodeDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({ description: 'Name of the episode', example: "Adventures of a lifetime"})
    name: string;

    @IsNotEmpty()
    @IsInt()
    @ApiProperty({ description: 'Length of the episode in seconds', example: 2200})
    length: number;

    @IsNotEmpty()
    @IsISO8601({ strict: true })
    @ApiProperty({ description: 'air date of the episode', example: '2014-01-01'})
    airDate: string;
    
    @IsNotEmpty()
    @IsInt()
    @ApiProperty({description: 'Season # of the episode', example: 1})
    seasonNum: number;
}
