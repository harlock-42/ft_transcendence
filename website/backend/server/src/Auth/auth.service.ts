import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UsersService } from "src/database/users/services/users.service";
import { JwtService } from "@nestjs/jwt";
import axios from "axios";
import { UserDto } from "src/database/users/dtos/user.dto";
import { User } from "src/database/users/entities/users.entity";
import { TokenDto } from "./dtos/token.dto";
import * as bcrypt from "bcrypt";
import { FtUserDataDto } from "./dtos/ftUserData.dto";
import { Payload } from "./Interfaces/payload.interface";

@Injectable()
export class AuthService
{
  constructor (
    private usersService: UsersService,
    private jwtService: JwtService
  )
  {
  }

  async validateUser (
    username: string,
    pass: string
  )
  {
    const user = await this.usersService.getOneByNickname(username);
    if (!user)
    {
      return null;
    }
    const isAuth = await bcrypt.compare(pass, user.password);
    if (user && isAuth)
    {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login (nickname: string, id: number): Promise<TokenDto>
  {
    const payload: Payload = { username: nickname, sub: id };
    const token: string = this.jwtService.sign(payload);
    return {
      token: token
    };
  }

  async getFtToken (codeData: string)
  {
    try
    {
      const data = await axios({
        method: "post",
        url: "https://api.intra.42.fr/oauth/token",
        data: {
          grant_type: "authorization_code",
          client_id: process.env.FT_UID,
          client_secret: process.env.FT_SECRET_UID,
          code: codeData,
          redirect_uri: "http://localhost:3001/callback"
        }
      });
      return data;
    } catch (err)
    {
      throw new UnauthorizedException();
    }
  }

  async getUserData (access_token: string, token_type: string): Promise<FtUserDataDto>
  {
    const userData = await axios({
      method: "get",
      url: "https://api.intra.42.fr/v2/me",
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    });
    const user: FtUserDataDto = {
      nickname: userData.data.login,
      ft_id: userData.data.id
    };
    return user;
  }

  async saveUserData (user: UserDto): Promise<User | void>
  {
    if (await this.usersService.isExist(user.nickname) === false)
    {
      return this.usersService.create(user);
    } else
    {
      return this.usersService.getOneByNickname(user.nickname);
    }
  }
}