import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AchievementBoxModule } from "../achievementBox/achievementBox.module";
import { UsersModule } from "../users/users.module";
import { Achievement } from "./achievement.entity";
import { AchievementService } from "./achievement.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([Achievement]),
    HttpModule,
    AchievementBoxModule,
    UsersModule
  ],
  providers: [
    AchievementService
  ],
  controllers: [],
  exports: [
    AchievementService,
    TypeOrmModule.forFeature([Achievement])
  ]
})
export class AchievementModule
{}