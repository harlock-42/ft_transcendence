import { IsAscii, IsNotEmpty, IsString, MaxLength } from "class-validator";

export class AchievementDto
{
  @IsNotEmpty()
  @IsString()
  @IsAscii()
  @MaxLength(50)
  name: string;
  @IsNotEmpty()
  @IsString()
  @IsAscii()
  @MaxLength(255)
  text: string;
}