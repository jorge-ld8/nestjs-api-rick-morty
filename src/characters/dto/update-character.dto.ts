import { IsString, IsOptional, IsNotEmpty, IsInt} from 'class-validator';

export class UpdateCharacterDto {
  @IsString()
  name: string;

  @IsString()
  type?: string;

  @IsInt()
  status_id: number;

  @IsInt()
  specie_id: number;
}