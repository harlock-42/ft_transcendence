import { Transform } from "class-transformer";
import { IsInt, IsNumber, IsPositive, IsString } from "class-validator";
import { toNumber } from "src/utils/cast.helper";

export class FtUserDataDto
{
  @IsString()
  nickname: string;
  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  @IsInt()
  @IsPositive()
  ft_id: number;
}