import { IsAscii, IsEmpty, IsString, Length, Matches } from "class-validator";

export class SettingMeDto
{
  @IsString()
  @IsAscii()
  @Length(2, 10)
  @Matches(/^[a-zA-Z0-9_\-]*$/)
  nickname: string;
}