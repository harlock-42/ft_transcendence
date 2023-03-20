import { Global, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TypeOrmConfigService } from "./database.service";

@Module({
  imports: [TypeOrmModule.forRootAsync({
    useClass: TypeOrmConfigService
  })]
})
export class DatabaseModule
{
}