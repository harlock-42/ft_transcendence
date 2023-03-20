import { IsAlphanumeric, IsBoolean, IsString, Max, Min } from "class-validator";
import { TokenDto } from "./token.dto";

export class AuthDataDto
{
  access_token: TokenDto;
  @IsString()
  @IsAlphanumeric() // or @IsAscii
  @Min(2)
  @Max(10)
  nickname: string;
  @IsBoolean()
  tfa: boolean;
}