import { IsString, IsOptional, IsNotEmpty} from 'class-validator';

export class CharacterResponse {
  id: number;

  name: string;

  status: string;

  species: string;

  type: string;
}
