import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Channel } from "../channel/channel.entity";
import { ChannelsModule } from "../channel/channels.module";
import { UsersModule } from "../users/users.module";
import { Message } from "./message.entity";
import { MessagesService } from "./messages.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, Channel]),
    ChannelsModule,
	UsersModule
  ],
  providers: [
    MessagesService
  ],
  controllers: [],
  exports: [
    MessagesService,
    TypeOrmModule.forFeature([Message])
  ]
})
export class MessagesModule
{
}