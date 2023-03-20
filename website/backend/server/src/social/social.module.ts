import { Module } from "@nestjs/common";
import { ChatService } from "./chat.service";
import { SocialGateway } from "./social.gateway";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Channel } from "../database/channel/channel.entity";
import { ChannelsService } from "../database/channel/channels.service";
import { MessagesService } from "../database/message/messages.service";
import { Message } from "../database/message/message.entity";
import { MessagesModule } from "../database/message/messages.module";
import { Achievement } from "src/database/achievement/achievement.entity";
import { AchievementService } from "src/database/achievement/achievement.service";
import { PrivateMessage } from "src/database/privateMessage/privateMessage.entity";
import { PrivateMessageService } from "src/database/privateMessage/privateMessage.service";
import { MessageBox } from "src/database/messageBox/messageBox.entity";
import { MessageBoxService } from "src/database/messageBox/messageBox.service";
import { Friend } from "src/database/friend/friend.entity";
import { FriendService } from "src/database/friend/friend.service";
import { GameModule } from "src/game/game.module";
import { UsersModule } from "src/database/users/users.module";
import { BanModule } from "src/database/ban/ban.module";
import { MuteModule } from "src/database/mute/mute.module";
import { User } from "src/database/users/entities/users.entity";
import { BlockModule } from "src/database/block/block.module";
import { AchievementBoxModule } from "src/database/achievementBox/achievementBox.module";
import { SocialController } from "./social.controller";
import { AchievementModule } from "src/database/achievement/achievement.module";
import { ChannelsModule } from "src/database/channel/channels.module";
import { PrivateMessageModule } from "src/database/privateMessage/privateMessages.module";
import { MessageBoxModule } from "src/database/messageBox/messageBox.module";
import { FriendModule } from "src/database/friend/friend.module";

@Module({
    imports: [
        MessagesModule,
        TypeOrmModule.forFeature([
            //   Channel,
            //   User,
            //   Message,
            //   Achievement,
            //   PrivateMessage,
            //   MessageBox,
            //   Friend
        ]),
        GameModule,
        UsersModule,
        BanModule,
        MuteModule,
        BlockModule,
        AchievementBoxModule,
        AchievementModule,
        ChannelsModule,
        MessagesModule,
        PrivateMessageModule,
        MessageBoxModule,
        FriendModule
    ],
    providers: [
        SocialGateway,
        ChatService,
        // MessagesService,
        // ChannelsService,
        // AchievementService,
        // PrivateMessageService,
        // MessageBoxService,
        // FriendService
    ],
    controllers: [
        SocialController
    ],
    exports: []
})
export class SocialModule {
}
