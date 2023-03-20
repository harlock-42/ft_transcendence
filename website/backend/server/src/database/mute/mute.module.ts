import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersModule } from "../users/users.module";
import { Mute } from "./mute.entity";
import { MuteService } from "./mute.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([Mute]),
    UsersModule
  ],
  providers: [
    MuteService
  ],
  controllers: [],
  exports: [
    MuteService
  ]
})
export class MuteModule
{
}