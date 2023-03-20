import { AGame } from "../Abstact and Interface Classes/AGame";
import { EnemyPad } from "../Actors/EnemyPad";
import { GameConfig } from "../config";
import { PadAlignment } from "../Utils/Enums";
import { Pad } from "../Actors/Pad";
import { APhysicalBody } from "../Abstact and Interface Classes/APhysicalBody";
import { GameService } from "../../game.service";

export class ClassicRoom extends AGame
{
  protected readonly enemyPad: EnemyPad;

  constructor (roomName: string, countPlayers: number, gameService: GameService)
  {
    super(roomName, gameService);
    this.maxNumberOfPlayers = countPlayers;
    if (countPlayers == 1)
    {
      this.enemyPad = this.createEnemyPad(GameConfig.width, GameConfig.height);
      this.physicsObject.unshift(this.enemyPad);
      this.actors.unshift(this.enemyPad);
      this.gameInfo.players.unshift(this.enemyPad);
    }
  }

  private createEnemyPad (
    width: number,
    height: number,
    align: PadAlignment = PadAlignment.RIGHT
  ): EnemyPad
  {
    const { padWidth, padHeight, position } = Pad.calculatePadPosition(
      width,
      height,
      align
    );
    return new EnemyPad(position, padWidth, padHeight, this.ball, align);
  }

  protected ResetGame ()
  {
    this.actors.find((actor) =>
    {
      if (actor instanceof APhysicalBody) actor.resetPosition();
    });
    // this.ball.resetPosition();
    super.ResetGame();
  }
}
