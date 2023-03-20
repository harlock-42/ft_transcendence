import { Injectable, Logger } from '@nestjs/common';
import { AGame } from './lib/Abstact and Interface Classes/AGame';
import { Server, Socket } from 'socket.io';
import { ClassicRoom } from './lib/GameRooms/ClassicRoom';
import { BonusRoom } from './lib/GameRooms/BonusRoom';
import { Interval } from '@nestjs/schedule';
import { UsersService } from 'src/database/users/services/users.service';
import { MatchService } from 'src/database/match/match.service';
import { User } from 'src/database/users/entities/users.entity';
import { EnemyPad } from './lib/Actors/EnemyPad';
import {
  ChallengeGameInfo,
  GamesInfo,
  MMQueryGameInfo,
  RequestGame,
  SocketWithDataMM,
} from './lib/ClassesForWebsocket';

@Injectable()
export class GameService {
  private RunningGames: AGame[] = [];
  private WaitingPlayer: SocketWithDataMM[] = [];
  private RequestGames: RequestGame[] = [];
  public server: Server;
  private logger: Logger = new Logger('Game Service');
  private timeToAccept: number = 1 * 30 * 1000; // Minutes * Seconds * Millis

  constructor(
    private matchService: MatchService,
    private userService: UsersService,
  ) {
    this.logger.log('gameService created');
  }

  public ConnectToGame(gameInfo: MMQueryGameInfo, client: Socket) {
    const ClientData = <SocketWithDataMM>client;
    ClientData.data.gamesQuery = gameInfo;

    // SinglePlayer
    if (!gameInfo.playMode) this.ConnectToSinglePlayerGames(ClientData);
    else this.WaitingPlayer.push(ClientData);
    client.broadcast.emit('AllGames', this.PrepareInfoGames());
  }

  private ConnectToSinglePlayerGames(client: SocketWithDataMM) {
    let game;
    // Classic
    if (!client.data.gamesQuery.mapMode)
      game = new ClassicRoom('SinglePlayer', 1, this);
    else game = new BonusRoom('SPBonusRoom', 1, this);

    game.PlayerConnect(client, client.data.gamesQuery.nickName);
    this.RunningGames.push(game);
    client.emit('RoomID', this.RunningGames.indexOf(game));
  }

  public ConnectToGameAsSpectator(client: Socket, index: number) {
    this.RunningGames[index].AddSpectator(client);
  }

  public addRequestGame(newRequest: RequestGame): RequestGame {
    const clientGames = this.RequestGames.filter((element) => {
      if (
        element.gameInfo.sender === newRequest.gameInfo.sender ||
        element.gameInfo.target === newRequest.gameInfo.target ||
        element.gameInfo.sender === newRequest.gameInfo.target
      )
        return element;
    });
    if (clientGames.length > 0) return clientGames[0];
    this.RequestGames.push(newRequest);
    newRequest.gameInfo.roomID = this.RequestGames.indexOf(newRequest);
    this.server.emit('AllChallengesGame', this.PrepareAllChallengeGameInfo());
    return newRequest;
  }

  public ConnectToChallenge(
    client: Socket,
    infoRoom: ChallengeGameInfo,
    clientNickName: string,
  ) {
    // this.logger.log(infoRoom);
    if (infoRoom.roomID > this.RequestGames.length) return;
    const ClientData = <SocketWithDataMM>client;
    ClientData.data.gamesQuery = new MMQueryGameInfo();
    ClientData.data.gamesQuery.nickName = clientNickName;
    ClientData.data.gamesQuery.mapMode = infoRoom.mapMode;
    this.RequestGames[infoRoom.roomID].sockets.push(ClientData);
    if (this.RequestGames[infoRoom.roomID].sockets.length == 2) {
      this.CreateMultiplayerRoom(
        this.RequestGames[infoRoom.roomID].sockets[0],
        this.RequestGames[infoRoom.roomID].sockets[1],
      );
      this.RequestGames.splice(infoRoom.roomID, 1);
    }
  }

  private CreateMultiplayerRoom(
    client1: SocketWithDataMM,
    client2: SocketWithDataMM,
  ) {
    let game;
    // Classic
    if (!client1.data.gamesQuery.mapMode)
      game = new ClassicRoom('MultiPlayer', 2, this);
    else game = new BonusRoom('MPBonusRoom', 2, this);

    this.RunningGames.push(game);
    game.PlayerConnect(client1, client1.data.gamesQuery.nickName);
    client1.emit('RoomID', this.RunningGames.indexOf(game));
    game.PlayerConnect(client2, client2.data.gamesQuery.nickName);
    client2.emit('RoomID', this.RunningGames.indexOf(game));
    this.server.emit('AllGames', this.PrepareInfoGames());
  }

  public SendAllTheGamesRunning(client: Socket) {
    client.emit('AllGames', this.PrepareInfoGames());
  }

  public SendAllFriendGames(client: Socket, nickName: string) {
    client.emit('AllChallengesGame', this.PrepareChallengeGameInfo(nickName));
  }

  public DisconnectFromGameAsSpectator(client: Socket) {
    for (let i = 0; i < this.RunningGames.length; ++i) {
      this.RunningGames[i].RemoveSpectator(client);
    }
  }

  private DisconnectFromGame(client: Socket) {
    for (let i = 0; i < this.RunningGames.length; ++i) {
      // this.logger.log(this.RunningGames[i].GetPlayer(client));
      if (this.RunningGames[i].GetPlayer(client) != undefined) {
        this.RunningGames[i].PlayerDisconnect(client);
      }
    }
  }

  public DisconnectFromGameService(client: Socket) {
    const PlayerDisconnected = this.WaitingPlayer.find((clientWithData) => {
      if (clientWithData.id == client.id) {
        return clientWithData;
      }
    });
    const index = this.WaitingPlayer.indexOf(PlayerDisconnected);
    if (index > -1) this.WaitingPlayer.splice(index, 1);

    this.RequestGames.find((room) => {
      if (room.checkIfClientConnected(client)) {
        const indexClient = room.sockets[0].id == client.id ? 0 : 1;
        room.sockets.splice(indexClient, 1);
        return room;
      }
    });
    this.DisconnectFromGame(client);
    this.server.emit('AllGames', this.PrepareInfoGames());
    // this.logger.log("The count of rooms = " + this.RunningGames.length);
  }

  public GameHasEnded(game: AGame) {
    this.logger.log('Game has ended');
    this.RunningGames.splice(this.RunningGames.indexOf(game), 1);
    this.server.emit('AllGames', this.PrepareInfoGames());

    if (
      game.GameInfo.players[0] instanceof EnemyPad ||
      game.GameInfo.players[1] instanceof EnemyPad
    )
      return;

    this.SendGameInfoToDb(game);
  }

  async SendGameInfoToDb(game: AGame) {
    const winner: User = await this.userService.getOneByNickname(
      game.EndGameInfo.winingPlayer.nickName,
      {
        achievementBoxes: true,
        matchs: true,
        friends: true,
      },
    );
    const loser: User = await this.userService.getOneByNickname(
      game.EndGameInfo.losingPlayer.nickName,
      {
        achievementBoxes: true,
        matchs: true,
        friends: true,
      },
    );
    await this.UpdateMatchHistoryDb(
      winner,
      loser,
      game.EndGameInfo.losingPlayer.score,
    );
  }

  async UpdateMatchHistoryDb(winner: User, loser: User, looserScore: number) {
    await this.matchService.addMatch(winner, loser, looserScore);
  }

  public handlePlayerInputs(mouseY: number, indexGame: number, client: Socket) {
    if (this.RunningGames.length <= indexGame) return;

    this.RunningGames[indexGame].MovePlayer(client, mouseY);
  }

  @Interval(1000)
  async checkMatchMakingPlayers() {
    if (this.WaitingPlayer.length < 2) return;
    // this.logger.log(this.WaitingPlayer.length);
    // this.logger.log('Checking Clients In Match Making');

    for (let i = 0; i < this.WaitingPlayer.length; ++i) {
      const curPlayer = this.WaitingPlayer[i];
      for (let j = 0; j < this.WaitingPlayer.length; ++j) {
        //Condition for matchmaking
        if (curPlayer == this.WaitingPlayer[j]) continue;
        if (
          curPlayer.data.gamesQuery.playMode ==
            this.WaitingPlayer[j].data.gamesQuery.playMode &&
          curPlayer.data.gamesQuery.mapMode ==
            this.WaitingPlayer[j].data.gamesQuery.mapMode
        ) {
          this.CreateMultiplayerRoom(curPlayer, this.WaitingPlayer[j]);
          this.WaitingPlayer.splice(j, 1);
          this.WaitingPlayer.splice(i, 1);
          return;
        }
      }
    }
  }

  @Interval(1000)
  async checkFriendsGames() {
    const requestsRemoved: RequestGame[] = [];
    this.RequestGames = this.RequestGames.filter((request: RequestGame) => {
      const timeElapse = new Date().getTime() - request.gameInfo.date.getTime();
      if (timeElapse < this.timeToAccept) {
        return request;
      } else {
        requestsRemoved.push(request);
      }
    });
    if (requestsRemoved && requestsRemoved.length > 0) {
      // console.table(requestsRemoved);
      for (let i = 0; i < requestsRemoved.length; ++i) {
        const clientsConnected = requestsRemoved[i].clientConnected();
        if (clientsConnected.length <= 0) continue;
        for (let i = 0; i < clientsConnected.length; ++i)
          clientsConnected[i].emit('RequestCanceled');
      }
      this.server.emit('AllChallengesGame', this.PrepareAllChallengeGameInfo());
    }
  }

  private PrepareInfoGames(): GamesInfo[] {
    const gamesInfo: GamesInfo[] = [];
    for (let i = 0; i < this.RunningGames.length; ++i) {
      gamesInfo.push(new GamesInfo(this.RunningGames[i], i));
    }
    return gamesInfo;
  }

  private PrepareChallengeGameInfo(nickName: string): ChallengeGameInfo[] {
    const gamesInfo: ChallengeGameInfo[] = [];
    this.RequestGames.filter((element) => {
      if (element.checkIfIsClientGame(nickName)) {
        gamesInfo.push(element.gameInfo);
        return element;
      }
    });
    return gamesInfo;
  }

  private PrepareAllChallengeGameInfo(): ChallengeGameInfo[] {
    const gamesInfo: ChallengeGameInfo[] = [];
    for (let i = 0; i < this.RequestGames.length; ++i) {
      gamesInfo.push(this.RequestGames[i].gameInfo);
    }
    return gamesInfo;
  }
}
