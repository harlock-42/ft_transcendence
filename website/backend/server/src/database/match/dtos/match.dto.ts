import {
  IsBoolean,
  IsBooleanString,
  IsInt,
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsNumberString,
  IsPositive,
  IsString,
  Max
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { toBoolean, toNumber } from "src/utils/cast.helper";
import { UserDto } from "src/database/users/dtos/user.dto";

export class MatchDto
{

  @IsNotEmpty()
  @IsBooleanString()
  isWinner: boolean;
  @IsNotEmpty()
  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  @IsInt()
  @IsPositive()
  @Max(10)
  looserScore: number;

  // @IsIn check if it s possible to check if the user exist in the database
  // @IsNotIn

  // @IsIn check if it s possible to check if the user exist in the database
  @IsNotEmpty()
  @IsNotEmptyObject()
  opponent: UserDto;

  elo: number;
}