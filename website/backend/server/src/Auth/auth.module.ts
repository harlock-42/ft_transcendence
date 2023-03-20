import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { UsersModule } from "src/database/users/users.module";
import { AuthController } from "./auth.controllers";
import { AuthService } from "./auth.service";
import { JwtModule } from "@nestjs/jwt";
import { jwtConstants } from "./constants";
import { UsersService } from "src/database/users/services/users.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { HttpModule } from "@nestjs/axios";
import { FortyTwoGuard, GqlAuthGuard, LocalAuthGuard } from "./auth.guards";
import { JwtStrategy } from "./jwt.strategy";
import { AchievementService } from "src/database/achievement/achievement.service";
import { Achievement } from "src/database/achievement/achievement.entity";
import { FriendService } from "src/database/friend/friend.service";
import { Friend } from "src/database/friend/friend.entity";
import { User } from "src/database/users/entities/users.entity";
import { AchievementBoxModule } from "src/database/achievementBox/achievementBox.module";
import { LocalStrategy } from "./local.strategy";
import { AchievementModule } from "src/database/achievement/achievement.module";
import { FriendModule } from "src/database/friend/friend.module";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [
    ConfigModule.forRoot(),
    PassportModule.register({
      session: false
    }),
    JwtModule.register({
      secret: process.env.SECRET,
      signOptions: { expiresIn: "7d" }
    }),
    TypeOrmModule.forFeature([
      Achievement,
      Friend
    ]),
    UsersModule,
    HttpModule,
    AchievementBoxModule,
    AchievementModule,
    FriendModule
  ],
  providers: [
    AuthService,
    FortyTwoGuard,
    JwtStrategy,
    LocalStrategy,
    GqlAuthGuard,
    LocalStrategy
  ],
  controllers: [
    AuthController
  ]
})

export class AuthModule
{
}