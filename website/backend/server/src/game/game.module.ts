import { Module } from "@nestjs/common";
import { GameService } from "./game.service";
import { GameGateway } from "./game.gateway";
import { UsersModule } from "src/database/users/users.module";
import { MatchModule } from "src/database/match/match.module";

@Module({
  imports: [
    MatchModule,
    UsersModule
  ],
  providers: [GameGateway, GameService],
  exports: [GameService]
})
export class GameModule
{
}
