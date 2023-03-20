import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersController } from "./users.controller";
import { UserGuardService } from "./guards/user-guard.service";
import { UsersService } from "./services/users.service";
import { User as UserEntity } from "./entities/users.entity";
import { AchievementBoxModule } from "../achievementBox/achievementBox.module";
import { TwoFactorAuthService } from "./services/twoFactorAuth.service";
import { FriendModule } from "../friend/friend.module";
import { TwoFactorAuth } from "./entities/twoFactorAuth.entity";
import { AchievementModule } from "../achievement/achievement.module";
import { MatchModule } from "../match/match.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      TwoFactorAuth
    ]),
    FriendModule,
    HttpModule,
    AchievementBoxModule
  ],
  providers: [
    UsersService,
    UserGuardService,
    TwoFactorAuthService
  ],
  controllers: [
    UsersController
  ],
  exports: [
    UsersService,
    TwoFactorAuthService
  ]
})
export class UsersModule
{
}
