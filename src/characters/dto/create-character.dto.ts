import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsInt} from 'class-validator';

export class CreateCharacterDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'The name of the character', example: "Pedro"})
  name: string;

  @IsString()
  @ApiProperty({ description: 'The type of the character', example: "Fish-Person"})
  type: string;

  @IsNotEmpty()
  @IsInt()
  @ApiProperty({ description: 'Id of the status', example: 1})
  status_id: number;

  @IsNotEmpty()
  @IsInt()
  @ApiProperty({ description: 'Id of the specie', example: 1})
  specie_id: number;
}