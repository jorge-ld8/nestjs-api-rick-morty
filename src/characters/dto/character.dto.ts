import { IsString, IsOptional, IsNotEmpty} from 'class-validator';

export class CharacterDto {
  @IsString()
  name: string;

  @IsString()
  status: string;

  @IsString()
  species: string;

  @IsString()
  type?: string;
}
