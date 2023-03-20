import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersModule } from "../users/users.module";
import { Ban } from "./ban.entity";
import { BanService } from "./ban.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([Ban]),
    UsersModule
  ],
  providers: [
    BanService
  ],
  controllers: [],
  exports: [
    BanService
  ]
})
export class BanModule
{
}