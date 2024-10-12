import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty, IsInt} from 'class-validator';

export class UpdateCharacterDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'The name of the character', example: "Pedro"})
  name?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'The type of the character', example: "Fish-Person"})
  type?: string;

  @IsOptional()
  @IsInt()
  @ApiProperty({ description: 'Id of the status', example: 1})
  status_id?: number;

  @IsOptional()
  @IsInt()
  @ApiProperty({ description: 'Id of the specie', example: 1})
  specie_id?: number;
}