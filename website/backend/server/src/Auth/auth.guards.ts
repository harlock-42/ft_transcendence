import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import axios from "axios";
import { Observable } from "rxjs";
import { IS_PUBLIC_KEY } from "./public.decorator";
import { AuthService } from "./auth.service";
import { GqlExecutionContext } from "@nestjs/graphql";

@Injectable()
export class LocalAuthGuard extends AuthGuard("local")
{
}

export class GqlAuthGuard extends AuthGuard("jwt")
{
  getRequest (context: ExecutionContext)
  {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }
}

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt")
{
  constructor (private reflector: Reflector)
  {
    super();
  }

  canActivate (context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean>
  {
    const isPublic = this.reflector.getAllAndOverride(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass()
    ]);
    if (isPublic)
    {
      return true;
    }
    return super.canActivate(context);
  }

  handleRequest<TUser = any> (err: any, user: any, info: any, context: ExecutionContext, status?: any): TUser
  {
    if (err || !user)
    {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}

@Injectable()
export class FortyTwoGuard implements CanActivate
{
  constructor (private authService: AuthService)
  {
  }

  canActivate (context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean>
  {
    return this.getUser(context);
  }

  async getUser (context: ExecutionContext): Promise<boolean>
  {
    const request = context.switchToHttp().getRequest();
    const data = await this.authService.getFtToken(request.headers.jwt);
    if (data)
    {
      const userData = await this.authService.getUserData(data.data.access_token, data.data.token_type);
      request.user = userData;
      return true;
    }
    return false;
  }
}