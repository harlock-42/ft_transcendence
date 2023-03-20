import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
  UnprocessableEntityException,
  UseGuards
} from "@nestjs/common";
import { FortyTwoGuard, LocalAuthGuard } from "./auth.guards";
import { AuthService } from "./auth.service";
import { Public } from "./public.decorator";
import { UsersService } from "src/database/users/services/users.service";
import { User } from "src/database/users/entities/users.entity";
import { RegisterDto } from "./dtos/register.dto";
import { LocalStrategy } from "./local.strategy";
import { AchievementService } from "src/database/achievement/achievement.service";
import { TokenDto } from "./dtos/token.dto";
import { Request } from "express";
import { AuthDataDto } from "./dtos/authData.dto";


@Controller("auth")
export class AuthController
{
  constructor (
    private authService: AuthService,
    private userService: UsersService,
    private achService: AchievementService
  )
  {
  }

  @UseGuards(LocalAuthGuard)
  @Post("login/local")
  async login (@Req() req)
  {
    return this.authService.login(req.user.nickname, req.user.id);
  }

  @Post("register/local")
  async register (@Body() body: RegisterDto)
  {
    try
    {
      let user: User;
      user = await this.userService.getOneByNickname(body.nickname);
      if (!user)
      {
        user = await this.userService.register(body);
        await this.achService.updateUser(user);
        return this.authService.login(user.nickname, user.id);
      } else
      {
        throw new UnauthorizedException();
      }
    } catch (error)
    {
      if (error instanceof UnauthorizedException)
      {
        throw error;
      } else
      {
        throw new BadRequestException();
      }
    }
  }

  @Get("callback")
  @UseGuards(FortyTwoGuard)
  async ftCallback (@Req() req: any): Promise<AuthDataDto>
  {
    try
    {
      const user: User = await this.userService.saveData(req.user);
      await this.achService.updateUser(user);
      const token: TokenDto = await this.authService.login(req.user.nickname, user.id);
      return {
        access_token: token,
        nickname: req.user.nickname,
        tfa: user.twoFactorAuth.activate
      };
    } catch (error)
    {
      if (error instanceof UnprocessableEntityException)
      {
        throw new UnprocessableEntityException();
      } else
      {
        throw new BadRequestException();
      }
    }
  }
}