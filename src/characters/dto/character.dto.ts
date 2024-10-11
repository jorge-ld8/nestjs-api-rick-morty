import { IsString, IsOptional, IsNotEmpty} from 'class-validator';

export class CharacterDto {
  id: number;

  @IsString()
  name: string;

  @IsString()
  status: string;

  @IsString()
  species: string;

  @IsString()
  type?: string;
}
