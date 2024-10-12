import { IsDate, IsDateString, IsISO8601, IsInt, IsNotEmpty, IsString } from "class-validator";

export class CreateEpisodeDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsInt()
    length: number;

    @IsNotEmpty()
    @IsISO8601({ strict: true })
    airDate: string;
    
    @IsNotEmpty()
    @IsInt()
    seasonNum: number;
}
