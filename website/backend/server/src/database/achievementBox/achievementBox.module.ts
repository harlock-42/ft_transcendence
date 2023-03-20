import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AchievementBox } from "./achievementBox.entity";
import { AchievementBoxService } from "./achievementBox.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AchievementBox
    ])
  ],
  providers: [
    AchievementBoxService
  ],
  controllers: [],
  exports: [
    AchievementBoxService
  ]
})
export class AchievementBoxModule
{
}