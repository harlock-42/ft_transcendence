import { Socket } from "socket.io";
import { AGame } from "./Abstact and Interface Classes/AGame";

export class QueryGamesInfo
{
  mapMode: boolean;
  playMode: boolean;
}

export class MMQueryGameInfo extends QueryGamesInfo
{
  nickName: string;
}

export class ChallengeGameInfo extends QueryGamesInfo
{
  sender: string;
  target: string;
  public roomID: number;
  public date: Date;
}

export interface SocketWithDataMM extends Socket
{
  data: {
    gamesQuery: MMQueryGameInfo;
  };
}

export class RequestGame
{
  public gameInfo: ChallengeGameInfo;
  public sockets: SocketWithDataMM[] = [];

  constructor ()
  {
    this.gameInfo = new ChallengeGameInfo();
    this.gameInfo.playMode = true;
  }

  public checkIfClientConnected (client: Socket): boolean
  {
    return (
      (this.sockets[0] && this.sockets[0].id == client.id) ||
      (this.sockets[1] && this.sockets[1].id == client.id)
    );
  }

  public clientConnected (): SocketWithDataMM[]
  {
    if (this.sockets == null || this.sockets.length == 0) return null;
    return this.sockets.slice(0, this.sockets.length);
  }

  public checkIfIsClientGame (nickName: string): boolean
  {
    return this.gameInfo.sender == nickName || this.gameInfo.target == nickName;
  }
}

export class GamesInfo
{
  public roomID: number;
  public Player1NickName: string;
  public Player2NickName: string;

  constructor (game: AGame, index: number)
  {
    this.roomID = index;
    this.Player1NickName = game.GameInfo.players[0].nickName;
    this.Player2NickName = game.GameInfo.players[1].nickName;
  }
}
