import { Transform } from "class-transformer";
import {
  IsAlpha,
  IsAlphanumeric,
  IsAscii,
  IsByteLength,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsPositive,
  IsString,
  IsUrl,
  Length,
  Matches,
  NotContains
} from "class-validator";
import { toNumber } from "src/utils/cast.helper";
import { AchievementBox } from "../../achievementBox/achievementBox.entity";
import { TwoFactorAuth } from "../entities/twoFactorAuth.entity";


export class UserDto
{


  @IsNotEmpty()
  @IsString()
  @IsAscii()
  @Length(2, 10)
  @Matches('[a-zA-Z0-9\-_]')
    // @NotContains("")
    // @IsAlpha()
    // @IsAlphanumeric()
  nickname: string;
  // make a nickname display

  // set a var to know the status of the user

  ft_id: number;


  @IsUrl()
  imgUrl: string;


  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  @IsInt()
  nbWin: number;
  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  @IsInt()
  nbLoose: number;

  achievementBoxes: AchievementBox[];

  twoFactorAuth: TwoFactorAuth;

}
