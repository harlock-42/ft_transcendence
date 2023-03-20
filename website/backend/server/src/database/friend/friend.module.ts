import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Friend } from "./friend.entity";
import { FriendService } from "./friend.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([Friend])
  ],
  providers: [
    FriendService
  ],
  controllers: [],
  exports: [
    FriendService
  ]
})
export class FriendModule
{
}