import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AchievementModule } from "../achievement/achievement.module";
import { UsersModule } from "../users/users.module";
import { MatchController } from "./match.controller";
import { Match } from "./match.entity";
import { MatchService } from "./match.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([Match]),
    UsersModule,
    AchievementModule
  ],
  providers: [
    MatchService
  ],
  controllers: [
    MatchController
  ],
  exports: [
    MatchService
  ]
})
export class MatchModule
{
}