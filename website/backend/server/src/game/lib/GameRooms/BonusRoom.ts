import { AGame } from "../Abstact and Interface Classes/AGame";
import { APhysicalBody } from "../Abstact and Interface Classes/APhysicalBody";
import { Obstacles } from "../Actors/Obstacles";
import { GameConfig } from "../config";
import { Vector } from "vector2d";
import { PadAlignment } from "../Utils/Enums";
import { EnemyPad } from "../Actors/EnemyPad";
import { Pad } from "../Actors/Pad";
import { GameService } from "../../game.service";

export class BonusRoom extends AGame
{
  protected readonly enemyPad: EnemyPad;
  protected readonly enemyPad2: EnemyPad;

  constructor (
    roomName: string,
    countPlayers: number,
    gameService: GameService
  )
  {
    super(roomName, gameService);
    this.maxNumberOfPlayers = countPlayers;
    const obstacle = new Obstacles(
      new Vector(
        GameConfig.width - GameConfig.width / 2,
        GameConfig.height - GameConfig.height / 2
      ),
      100,
      100,
      45
    );

    const obstacle2 = new Obstacles(
      new Vector(
        GameConfig.width - GameConfig.width / 6,
        GameConfig.height - GameConfig.height / 5
      ),
      100,
      20,
      -60
    );

    const obstacle3 = new Obstacles(
      new Vector(
        GameConfig.width - GameConfig.width / 6,
        GameConfig.height / 5
      ),
      100,
      20,
      60
    );

    const obstacle4 = new Obstacles(
      new Vector(GameConfig.width / 6, GameConfig.height / 5),
      100,
      20,
      -60
    );

    const obstacle5 = new Obstacles(
      new Vector(
        GameConfig.width / 6,
        GameConfig.height - GameConfig.height / 5
      ),
      100,
      20,
      60
    );
    this.gameInfo.obstacles = [
      obstacle,
      obstacle2,
      obstacle3,
      obstacle4,
      obstacle5
    ];
    this.physicsObject.unshift(obstacle);
    this.physicsObject.unshift(obstacle2);
    this.physicsObject.unshift(obstacle3);
    this.physicsObject.unshift(obstacle4);
    this.physicsObject.unshift(obstacle5);

    this.ball.position = new Vector(GameConfig.width / 2, 0);
    this.ball.velocity.setAxes(this.ball.dirStart, -1.25);

    if (this.maxNumberOfPlayers == 1)
    {
      this.enemyPad = this.createEnemyPad(GameConfig.width, GameConfig.height);
      // this.enemyPad2 = this.createEnemyPad(GameConfig.width, GameConfig.height, PadAlignment.LEFT);

      this.physicsObject.unshift(this.enemyPad);
      // this.physicsObject.unshift(this.enemyPad2);
      this.actors.unshift(this.enemyPad);
      // this.actors.unshift(this.enemyPad2);
      this.gameInfo.players.unshift(this.enemyPad);
      // this.GameInfo.players.unshift(this.enemyPad2);
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
    this.ball.position = new Vector(GameConfig.width / 2, 0);
    this.ball.velocity.setAxes(this.ball.dirStart, -1.25);
    super.ResetGame();
  }
}
