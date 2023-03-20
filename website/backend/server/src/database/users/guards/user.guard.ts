import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Observable } from "rxjs";
import { UserGuardService } from "./user-guard.service";

@Injectable()
export class IsNickNotInUse implements CanActivate
{
  constructor (private userGuardService: UserGuardService)
  {
  }

  canActivate (
    context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean>
  {
    const request = context.switchToHttp().getRequest();
    return this.userGuardService.isNickNotInUse(request.body.nickname);
  }
}