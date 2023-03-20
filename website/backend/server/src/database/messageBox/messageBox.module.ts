import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MessageBox } from "./messageBox.entity";
import { MessageBoxService } from "./messageBox.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([MessageBox])
  ],
  providers: [
    MessageBoxService
  ],
  controllers: [],
  exports: [
    MessageBoxService
  ]
})
export class MessageBoxModule
{
}