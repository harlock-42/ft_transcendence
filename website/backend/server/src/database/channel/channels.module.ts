import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BanModule } from "../ban/ban.module";
import { Message } from "../message/message.entity";
import { MuteModule } from "../mute/mute.module";
import { Channel } from "./channel.entity";
import { ChannelsService } from "./channels.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, Channel]),
    BanModule,
    MuteModule
  ],
  providers: [
    ChannelsService
  ],
  controllers: [],
  exports: [
    ChannelsService,
    TypeOrmModule.forFeature([Channel])
  ]
})
export class ChannelsModule
{
}