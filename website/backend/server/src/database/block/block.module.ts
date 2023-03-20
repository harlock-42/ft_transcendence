import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersModule } from "../users/users.module";
import { Block } from "./block.entity";
import { BlockService } from "./block.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Block
    ]),
    UsersModule
  ],
  providers: [
    BlockService
  ],
  controllers: [],
  exports: [
    BlockService
  ]
})
export class BlockModule
{
}