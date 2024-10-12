import { IsString, IsNotEmpty, IsInt} from 'class-validator';

export class CreateCharacterDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsString()
  type: string;

  @IsNotEmpty()
  @IsInt()
  status_id: number;

  @IsNotEmpty()
  @IsInt()
  specie_id: number;
}