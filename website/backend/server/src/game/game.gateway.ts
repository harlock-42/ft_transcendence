import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';
import { ChallengeGameInfo, MMQueryGameInfo } from './lib/ClassesForWebsocket';

@WebSocketGateway(8080, {
  cors: {
    origin: 'http://localhost:3001',
  },
})
export class GameGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private logger: Logger = new Logger('Game Gateway');
  private _server: Server;

  constructor(private readonly gameService: GameService) {
    this.logger.log('Game GateWay Created');
  }

  afterInit(server: Server) {
    this.logger.log('Server is initialized');
    this._server = server;
    this.gameService.server = this._server;
  }

  @SubscribeMessage('playerConnectToGame')
  handlePlayerConnection(client: Socket, data: MMQueryGameInfo) {
    this.gameService.ConnectToGame(data, client);
  }

  //
  @SubscribeMessage('handleChallengeConnection')
  handleChallengeConnection(
    client: Socket,
    args: { infoRoom: ChallengeGameInfo; clientNickName: string },
  ) {
    this.gameService.ConnectToChallenge(
      client,
      args.infoRoom,
      args.clientNickName,
    );
  }

  @SubscribeMessage('connectSpecToGame')
  handleSpecConnection(client: Socket, data: number) {
    this.gameService.ConnectToGameAsSpectator(client, data);
  }

  @SubscribeMessage('disconnectSpecFromGame')
  handleSpecDisconnection(client: Socket) {
    this.logger.log('Player Disconnect From Spec');
    this.gameService.DisconnectFromGameAsSpectator(client);
  }

  @SubscribeMessage('disconnectFromGame')
  handleDisconnectFromGame(client: Socket) {
    this.logger.log('Player Disconnect From Game');
    this.gameService.DisconnectFromGameService(client);
  }

  @SubscribeMessage('getAllGames')
  handleGetAllGames(client: Socket) {
    this.gameService.SendAllTheGamesRunning(client);
  }

  @SubscribeMessage('getAllFriendsGame')
  getAllFriendGames(client: Socket, nickName: string) {
    this.gameService.SendAllFriendGames(client, nickName);
  }

  @SubscribeMessage('clientInput')
  handleInput(client: Socket, data: { index: number; posY: number }) {
    this.gameService.handlePlayerInputs(data.posY, data.index, client);
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.gameService.DisconnectFromGameService(client);
    this.gameService.DisconnectFromGameAsSpectator(client);
  }
}
