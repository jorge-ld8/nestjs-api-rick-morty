import { IsDate, IsDateString, IsISO8601, IsInt, IsNotEmpty, IsString } from "class-validator";

export class CreateEpisodeDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsInt()
    length: number;

    @IsNotEmpty()
    // @IsDateString({}, { message: 'Invalid date format. Expected YYYY-MM-DD.' })
    @IsISO8601({ strict: true })
    airDate: string;
    
    @IsNotEmpty()
    @IsInt()
    season_id: number;
}
//   name         String      @db.VarChar(200)
//   length       Int         
//   airDate      DateTime   
//   status_id    Int
//   season_id    Int
//   episode_code String      @db.VarChar(100)
//   episode_id   Int         @id @default(autoincrement())
//   Season       Subcategory @relation(fields: [season_id], references: [subcategory_id])
//   Status       Status      @relation(fields: [status_id], references: [status_id])