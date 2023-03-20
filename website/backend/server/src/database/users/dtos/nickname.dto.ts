import { IsAscii, IsNotEmpty, IsString, Length } from "class-validator";

export class NicknameDto
{
  @IsNotEmpty()
  @IsString()
  @IsAscii()
  @Length(2, 10)
  nickname: string;
}