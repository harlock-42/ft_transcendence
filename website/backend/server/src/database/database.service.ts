import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from "@nestjs/typeorm";
import { Achievement } from "src/database/achievement/achievement.entity";
import { Channel } from "src/database/channel/channel.entity";
import { Message } from "src/database/message/message.entity";
import { Match } from "src/database/match/match.entity";
import { PrivateMessage } from "./privateMessage/privateMessage.entity";
import { MessageBox } from "./messageBox/messageBox.entity";
import { Friend } from "./friend/friend.entity";
import { Ban } from "./ban/ban.entity";
import { Mute } from "./mute/mute.entity";
import { User } from "./users/entities/users.entity";
import { Block } from "./block/block.entity";
import { AchievementBox } from "./achievementBox/achievementBox.entity";
import { TwoFactorAuth } from "./users/entities/twoFactorAuth.entity";

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory
{
  constructor (private readonly configService: ConfigService)
  {
  }

  createTypeOrmOptions (): TypeOrmModuleOptions
  {
    return {
      type: "postgres",
      host: this.configService.get("database.host"),
      port: this.configService.get("database.port"),
      username: this.configService.get("database.user"),
      password: this.configService.get("database.password"),
      database: this.configService.get("database.name"),
      entities: [
        User,
        Channel,
        Message,
        Achievement,
        Match,
        PrivateMessage,
        MessageBox,
        Friend,
        Ban,
        Mute,
        Block,
        AchievementBox,
        TwoFactorAuth
      ],
      synchronize: true
    };
  }
}
