import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PrivateMessage } from "./privateMessage.entity";
import { PrivateMessageService } from "./privateMessage.service";


@Module({
  imports: [
    TypeOrmModule.forFeature([PrivateMessage])
  ],
  providers: [
    PrivateMessageService
  ],
  controllers: [],
  exports: [
    PrivateMessageService
  ]
})
export class PrivateMessageModule
{
}