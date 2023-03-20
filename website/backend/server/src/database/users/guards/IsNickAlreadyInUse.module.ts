import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { IsNickNotInUse } from "./user.guard";
import { UserGuardService } from "./user-guard.service";
import { User } from "../entities/users.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    HttpModule
  ],
  providers: [UserGuardService, IsNickNotInUse]
})
export class UserGuardModule
{

}