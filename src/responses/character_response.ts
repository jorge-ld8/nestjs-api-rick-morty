import { IsString, IsOptional, IsNotEmpty} from 'class-validator';

export class CharacterResponse {
  id: number;

  @IsString()
  name: string;

  @IsString()
  status: string;

  @IsString()
  species: string;

  @IsString()
  type: string;
}
