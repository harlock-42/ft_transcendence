import { Injectable, Req } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { env } from "process";
import { jwtConstants } from "./constants";
import { Validate } from "./Interfaces/validate.interface";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy)
{
  constructor ()
  {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        JwtStrategy.extractJWT
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.SECRET
    });
  }

  private static extractJWT (@Req() req): string | null
  {
    if (
      req.cookies &&
      "token" in req.cookies &&
      req.cookies.token.length > 0
    )
    {
      return req.cookies.token;
    }
    return null;
  }

  async validate (payload: any): Promise<Validate>
  {
    return {
      userId: payload.sub,
      username: payload.username
    };
  }
}