import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { AppService } from "./app.service";
import { UsersModule } from "./database/users/users.module";
import configuration from "./config/configuration";
import { AuthModule } from "./Auth/auth.module";
import { GameModule } from "./game/game.module";
import { SocialModule } from "./social/social.module";
import { AppController } from "./app.controller";
import { DatabaseModule } from "./database/database.module";
import { AchievementModule } from "./database/achievement/achievement.module";
import { MatchModule } from "./database/match/match.module";
import { ChannelsModule } from "./database/channel/channels.module";
import { MessagesModule } from "./database/message/messages.module";
import { PrivateMessageModule } from "./database/privateMessage/privateMessages.module";
import { MessageBoxModule } from "./database/messageBox/messageBox.module";
import { FriendModule } from "./database/friend/friend.module";
import { BanModule } from "./database/ban/ban.module";
import { BlockModule } from "./database/block/block.module";
import { AchievementBoxModule } from "./database/achievementBox/achievementBox.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration]
    }),
    ScheduleModule.forRoot(),
    GameModule,
    SocialModule,
    DatabaseModule,
    UsersModule,
    AchievementModule,
    MatchModule,
    ChannelsModule,
    MessagesModule,
    PrivateMessageModule,
    AuthModule,
    MessageBoxModule,
    FriendModule,
    BanModule,
    BlockModule,
    AchievementBoxModule
  ],
  controllers: [AppController],
  providers: [
    AppService
  ]
})
export class AppModule
{
}
