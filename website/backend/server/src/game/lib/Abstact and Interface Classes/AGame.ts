import { IActor } from "./IActor";
import { PhysicsResolver } from "../PhysicsResolver";
import { Ball } from "../Actors/Ball";
import { GameConfig } from "../config";
import { Vector } from "vector2d";
import { Field } from "../Actors/Field";
import { InfoEndGameDto, InfoGameDto } from "../../dto/info-game.dto";
import { Socket } from "socket.io";
import { Logger } from "@nestjs/common";
import { PlayerPad } from "../Actors/PlayerPad";
import { APhysicalBody } from "./APhysicalBody";
import {
  GameState,
  PadAlignment,
  ScoreActionEvent
} from "../Utils/Enums";
import { TypedEventEmitter } from "../Utils/CustomEventEmitter";
import { Pad } from "../Actors/Pad";
import { GameService } from "../../game.service";

export abstract class AGame
{
  protected connections: Socket[];
  protected spectators: Socket[];
  protected maxNumberOfPlayers: number;

  protected type: string;
  protected maxScore = 11; //Original its 11
  protected gameState: GameState;
  protected gameInfo: InfoGameDto;

  get GameInfo (): InfoGameDto
  {
    return this.gameInfo;
  }

  protected endGameInfo: InfoEndGameDto;

  get EndGameInfo (): InfoEndGameDto
  {
    return this.endGameInfo;
  }

  private physicsResolver: PhysicsResolver;
  private readonly scoreEventListener: TypedEventEmitter<ScoreActionEvent>;
  private readonly gameService: GameService;

  protected actors: IActor[];
  protected physicsObject: APhysicalBody[];

  protected readonly field: Field;
  protected readonly ball: Ball;
  protected logger: Logger;
  private _timer: NodeJS.Timeout;

  protected constructor (type: string, gameService: GameService)
  {
    this.gameService = gameService;
    this.type = type;
    this.logger = new Logger(this.type);
    this.gameInfo = new InfoGameDto();
    this.endGameInfo = new InfoEndGameDto();
    this.scoreEventListener = new TypedEventEmitter<ScoreActionEvent>();
    this.gameInfo.players = [];
    this.connections = [];
    this.spectators = [];
    this.gameInfo.gameConfig = GameConfig;

    this.ball = new Ball(
      new Vector(GameConfig.width / 2, GameConfig.height / 2),
      GameConfig.ballRadius,
      GameConfig.ballRadius,
      this.scoreEventListener
    );
    this.field = new Field(
      new Vector(0, 0),
      GameConfig.width,
      GameConfig.height
    );

    this.actors = [this.ball];
    this.physicsObject = [this.field, this.ball];
    this.gameInfo.ball = this.ball;
    this.gameInfo.maxScore = this.maxScore;

    this.registerScoreEvents();
    this.gameState = GameState.SetUp;
  }


  public ScheduleUpdate ()
  {
    this.start();
    this.gameState = GameState.Running;
    this._timer = setInterval(async () =>
    {
      try
      {
        await this.update();
      } catch (err)
      {
        this.logger.log(err);
      }
    }, 5);
  }

  protected start (): void
  {
    this.physicsResolver = new PhysicsResolver(this.physicsObject);
  }

  protected async update ()
  {
    if (this.gameState === GameState.Goal) this.ResetGame();
    if (this.gameState !== GameState.Running) return;
    this.actors.forEach((actor) => actor.act());
    this.physicsResolver.resolveCollisions();
    if (this.gameState !== GameState.Running) return;
    this.BroadcastGameInfo("newFrame", this.gameInfo);
    this.BroadcastToSpectators("newFrame", this.gameInfo);
  }

  public async MovePlayer (socket: Socket, mouseY: number)
  {
    const playerPad = this.GetPlayer(socket);
    if (playerPad == undefined) return;
    playerPad.saveMousePos(mouseY);
  }

  public isRunning (): boolean
  {
    return this.gameState == GameState.Running;
  }

  protected ResetGame ()
  {
    this.gameState = GameState.Running;
  }

  protected registerScoreEvents ()
  {
    this.scoreEventListener.on((scoreEvent) =>
    {
      this.gameState = GameState.Goal;
      switch (scoreEvent)
      {
        case ScoreActionEvent.LEFT_PLAYER_SCORED:
          this.gameInfo.players.find((player) =>
          {
            // this.logger.log(player.alignment + ' ' + player.nickName);
            if (player.alignment === PadAlignment.LEFT)
              this.IncreasePlayerScore(player);
          });
          // this.logger.log('Left Player Scored!');
          break;
        case ScoreActionEvent.RIGHT_PLAYER_SCORED:
          this.gameInfo.players.find((player) =>
          {
            // this.logger.log(player.alignment + ' ' + player.nickName);
            if (player.alignment === PadAlignment.RIGHT)
              this.IncreasePlayerScore(player);
          });
          // this.logger.log('Right Player Scored!');
          break;
      }
    });
  }

  protected IncreasePlayerScore (player: Pad)
  {
    player.score++;
    if (player.score >= this.maxScore)
    {
      this.gameState = GameState.ShutDown;
      this.endGameInfo.winingPlayer = player;
      this.endGameInfo.losingPlayer = <PlayerPad>this.gameInfo.players.find((otherPlayer) =>
        {
          if (otherPlayer.nickName != player.nickName) return otherPlayer;
        }
      );
      this.BroadcastGameInfo("endGame", this.endGameInfo);
      this.BroadcastToSpectators("endGame", this.endGameInfo);
      this.connections.splice(0, this.connections.length);
      this.spectators.splice(0, this.connections.length);
      this.gameService.GameHasEnded(this);
    }
  }

  protected BroadcastGameInfo (eventName: string, data: any)
  {
    this.connections.forEach((s) =>
    {
      s.emit(eventName, data);
    });
  }

  public PlayerConnect (socket: Socket, nickName: string)
  {
    if (this.connections.length >= this.maxNumberOfPlayers)
    {
      this.logger.log("This room is full");
      return;
    }
    this.assignPlayerToGame(socket, nickName);
    if (this.connections.length == this.maxNumberOfPlayers)
      this.ScheduleUpdate();
  }

  public AddSpectator (socket: Socket)
  {
    this.spectators.push(socket);
  }

  public RemoveSpectator (socket: Socket)
  {
    const index = this.spectators.indexOf(socket);
    if (index != -1) this.spectators.splice(index, 1);
  }

  private BroadcastToSpectators (eventName: string, data: any)
  {
    if (this.spectators.length <= 0) return;
    this.spectators.forEach((s) =>
    {
      s.emit(eventName, data);
    });
  }

  public PlayerDisconnect (socket: Socket)
  {
    const index = this.connections.indexOf(socket);
    if (index === -1)
    {
      this.logger.warn("No socket found for disconnect");
      return;
    }
    this.gameState = GameState.ShutDown;
    this.endGameInfo.losingPlayer = this.GetPlayer(socket);
    if (this.endGameInfo.losingPlayer == this.gameInfo.players[0])
      this.endGameInfo.winingPlayer = this.gameInfo.players[1];
    else
      this.endGameInfo.winingPlayer = this.gameInfo.players[0];
    this.connections.splice(index, 1);
    this.BroadcastGameInfo("endGame", this.endGameInfo);
    this.BroadcastToSpectators("endGame", this.endGameInfo);
    this.connections.splice(0, this.connections.length);
    this.spectators.splice(0, this.connections.length);
    // this.logger.log('Player got DisconnectedFromGames');
    this.gameService.GameHasEnded(this);
    clearInterval(this._timer);
  }

  public NoMorePlayers (): boolean
  {
    return this.connections.length <= 0;
  }

  public GetPlayer (socket: Socket): PlayerPad
  {
    return <PlayerPad>this.actors.find((actor) =>
    {
      if (actor instanceof PlayerPad && actor.socketID === socket.id)
        return actor;
    });
  }

  protected assignPlayerToGame (socket: Socket, nickName: string)
  {
    let side = PadAlignment.LEFT;
    if (this.connections.length >= 1) side = PadAlignment.RIGHT;
    const playerPad = PlayerPad.createPlayerPad(
      GameConfig.width,
      GameConfig.height,
      side,
      nickName
    );
    playerPad.socketID = socket.id;
    this.physicsObject.unshift(playerPad);
    this.actors.unshift(playerPad);
    this.gameInfo.players.unshift(playerPad);
    this.connections.unshift(socket);
    socket.emit("startingFrame", this.gameInfo);
  }
}
