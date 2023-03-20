import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WsResponse
} from "@nestjs/websockets";
import { Logger } from "@nestjs/common";
import { Socket, Server } from "socket.io";

@WebSocketGateway({
  cors: {
    origin: "*"
  }
})
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private logger: Logger = new Logger("AppGateway");
  private _server: Server;

  afterInit (server: Server)
  {
    this._server = server;
    this.logger.log("Server is initialized");
  }

  @SubscribeMessage("msgToServer")
  handleMessage (client: Socket, data: string)
  {
    this._server.emit("msgToClient", data);
  }

  handleConnection (client: Socket, ...args: any[])
  {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect (client: Socket)
  {
    this.logger.log(`Client disconnected: ${client.id}`);
  }
}