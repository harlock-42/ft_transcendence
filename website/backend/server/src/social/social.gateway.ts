import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer
} from "@nestjs/websockets";
import { Logger } from "@nestjs/common";
import { Socket, Server } from "socket.io";
import { ChatService } from "./chat.service";
import { FriendStatus } from "src/database/friend/friend.entity";
import { ChatErrors } from "./lib/chat.errors";
import { Ban } from "src/database/ban/ban.entity";
import {
    ChannelDTO,
    MessageDTO,
    RoomDTO,
    RoomRestrictionDTO,
    RoomSettingsDTO,
    TargetDTO,
    TargetInRoomDTO
} from "./dto/gateway.dtos";
import { User } from "src/database/users/entities/users.entity";
import { Room, RoomType } from "./lib/chat.types";
import { Responses } from "./lib/Responses";

@WebSocketGateway(8100, {
    cors: {
        origin: "http://localhost:3001"
    },
    maxHttpBufferSize: 5*1e6
})
export class SocialGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private logger: Logger = new Logger("Chat Gateway");
    @WebSocketServer()
    private server: Server;
    private clientList: Map<string, Socket> = new Map();

    constructor(private readonly chatService: ChatService) {}

    async handleConnection(client: Socket) {
        const nickname: string = <string>client.handshake.query.nickname;

        this.logger.log(`Client connected: ${client.id}`);
        this.clientList.set(nickname, client);
        this.server.emit('upStatus', {target: nickname, newStatus: true});
    }

    async handleDisconnect(client: Socket) {
        const nickname: string = <string>client.handshake.query.nickname;

        this.logger.log(`Client disconnected: ${client.id}`);
        this.clientList.delete(nickname);
        setTimeout(() => {
            if (!this.clientList.has(nickname)) {
                this.server.emit('upStatus', {target: nickname, newStatus: false});
            }
        }, 2000)
    }

    @SubscribeMessage("updateNickname")
    updateNickname(@ConnectedSocket() client: Socket, @MessageBody() {oldNickname, newNickname}: {oldNickname: string, newNickname: string}) {
        this.clientList.delete(oldNickname);
        this.clientList.set(newNickname, client);
    }

    @SubscribeMessage("getStatus")
    getStatus(@ConnectedSocket() client: Socket, @MessageBody() nickname: string) {
        return (this.clientList.has(nickname));
    }

    @SubscribeMessage("initChannels")
    async initChannels(@ConnectedSocket() client: Socket, @MessageBody() nickname: string) {
        return (await this.chatService.initChannels(client, nickname));
    }

    @SubscribeMessage("initPms")
    async initPms(@ConnectedSocket() client: Socket, @MessageBody() nickname: string) {
        return (await this.chatService.initPms(client, nickname));
    }

    @SubscribeMessage("initFriends")
    async initFriends(@MessageBody() nickname: string) {
        return (await this.chatService.getFriendList(nickname));
    }

    @SubscribeMessage("checkConnected")
    async checkConnected(@MessageBody() nickname: string) {
        if (this.clientList.has(nickname) && this.clientList.get(nickname).connected) {
            return (true);
        }
        return (false);
    }

    @SubscribeMessage("send")
    async sendMessage(@ConnectedSocket() client: Socket, @MessageBody() newMessage: MessageDTO) {
        if (newMessage.target.type === RoomType.CHANNEL) {
            this.chatService.sendMessage(newMessage.text, newMessage.target.room.name, newMessage.senderNickname, newMessage.date)
                .then(() => {
                    this.server.to(newMessage.target.room.name).emit("receive", newMessage);
                })
                .catch((error: ChatErrors) => {
                    switch (error) {
                        case ChatErrors.MUTED:
                            client.emit("receiveInfo", Responses.cannotSendMutted(newMessage.target.room.name));
                            break;
                        case ChatErrors.MESSAGETOOBIG:
                            client.emit("receiveInfo", Responses.messageTooBig());
                            break;
                        default:
                            this.logger.log("send: undefined error");
                    }
                });
        } else if (newMessage.target.type === RoomType.PM) {
            this.chatService.sendPrivateMessage(newMessage.senderNickname, newMessage.target.room.name, newMessage.text, newMessage.date)
                .then(() => {
                    const targetSocket: Socket = this.clientList.get(newMessage.target.room.name);

                    client.emit("receive", newMessage);
                    if (targetSocket !== undefined && targetSocket.connected === true) {
                        targetSocket.emit("joinedPm", newMessage.senderNickname);
                        targetSocket.emit("receive", newMessage);
                    }
                })
                .catch((error: ChatErrors) => {
                    switch (error) {
                        case ChatErrors.BLOCKED:
                            client.emit("receiveInfo", Responses.cannotSendBlocked(newMessage.target.room.name));
                            break;
                        case ChatErrors.MESSAGETOOBIG:
                            client.emit("receiveInfo", Responses.messageTooBig());
                            break;
                        default:
                            this.logger.log("send: undefined error");
                    }
                });
        }
    }

    @SubscribeMessage("createPm")
    async createPm(@ConnectedSocket() client: Socket, @MessageBody() args: TargetDTO) {
        this.chatService.createPrivateConv(args.nickname, args.target)
            .then(() => {
                client.emit("joinedPm", args.target);
            });
    }

    @SubscribeMessage("closePm")
    async closePm(@ConnectedSocket() client: Socket, @MessageBody() args: TargetDTO) {
        this.chatService.closePrivateConv(args.nickname, args.target)
            .then(() => {
                client.emit("leftPm", args.target);
            });
    }

    @SubscribeMessage("getPublicChannels")
    async getPublicChannels(@MessageBody() filter?: string) {
        return (await this.chatService.getPublicChannels(filter));
    }

    @SubscribeMessage("getChannelInvites")
    async getChannelInvites(@MessageBody() nickname: string) {
        return (await this.chatService.getChannelInvites(nickname));
    }

    @SubscribeMessage("getUsers")
    async getUsers(@MessageBody() filter?: string) {
        return (await this.chatService.getUsers(filter));
    }

    @SubscribeMessage("getUsersInChannel")
    async getUsersInChannel(@MessageBody() args: { channelName: string, filter?: string }) {
        return (await this.chatService.getUsersInChannel(args.channelName, args.filter));
    }

    @SubscribeMessage("getAllInChannel")
    async getAllInChannel(@MessageBody() channelName: string) {
        return (await this.chatService.getAllInChannel(channelName));
    }

    @SubscribeMessage("getAllInPms")
    async getAllInPms(@MessageBody() args: TargetDTO) {
        return (await this.chatService.getAllInPms(args.nickname, args.target));
    }

    @SubscribeMessage("getRelationInfos")
    async getRelationInfos(@MessageBody() args: TargetDTO) {
        return (await this.chatService.getRelationInfos(args.nickname, args.target));
    }

    @SubscribeMessage("create")
    async create(@ConnectedSocket() client: Socket, @MessageBody() args: ChannelDTO) {
        this.chatService.createChannel(args)
            .then((resolve: Room) => {

                client.join(resolve.name);
                client.emit("joinedRoom", resolve);
            })
            .catch((error: ChatErrors) => {
                switch (error) {
                    case ChatErrors.ALREADYEXIST:
                        client.emit("receiveInfo", Responses.channelAlreadyExist(args.channelName));
                        break;
                    case ChatErrors.NAMEFORBIDDENCHAR:
                        client.emit("receiveInfo", Responses.channelNameForbiddenChar());
                        break;
                    case ChatErrors.NAMETOOBIG:
                        client.emit("receiveInfo", Responses.channelNameTooBig());
                        break;
                    case ChatErrors.NAMENOALNUM:
                        client.emit("receiveInfo", Responses.channelNameNoAlnum());
                        break;
                    case ChatErrors.TOPICFORBIDDENCHAR:
                        client.emit("receiveInfo", Responses.channelTopicForbiddenChar());
                        break;
                    case ChatErrors.TOPICTOOBIG:
                        client.emit("receiveInfo", Responses.channelTopicTooBig());
                        break;
                    case ChatErrors.TOPICNOALNUM:
                        client.emit("receiveInfo", Responses.channelTopicNoAlnum());
                        break;
                    case ChatErrors.BADIMAGETYPE:
                        client.emit("receiveInfo", Responses.channelBadImageType());
                        break;
                    default:
                        this.logger.log("create: undefined error");
                }
            });
    }

    @SubscribeMessage("join")
    async join(@ConnectedSocket() client: Socket, @MessageBody() args: RoomDTO) {
        this.chatService.join(args.nickname, args.room, args.password)
            .then((resolve: Room) => {
                if (!client.rooms.has(resolve.name)) {
                    client.join(resolve.name);
                    client.broadcast.to(resolve.name).emit("receiveInfo", Responses.userJoined(args.nickname, args.room));
                }
                client.emit("joinedRoom", resolve);
                client.to(args.room).emit("updateChannelUsers", { channelName: args.room, newUser: args.nickname });
            })
            .catch((error: ChatErrors) => {
                switch (error) {
                    case ChatErrors.NOSUCHCHANNEL:
                        client.emit("receiveInfo", Responses.noSuchChannel(args.room));
                        break;
                    case ChatErrors.ALREADYINCHAN:
                        client.emit("receiveInfo", Responses.youAlreadyInChannel(args.room));
                        break;
                    case ChatErrors.BANNED:
                        client.emit("receiveInfo", Responses.cannotJoinBanned(args.room));
                        break;
                    case ChatErrors.NOTINVITED:
                        client.emit("receiveInfo", Responses.cannotJoinPrivate(args.room));
                        break;
                    case ChatErrors.BADPASSWORD:
                        client.emit("receiveInfo", Responses.cannotJoinBadPass(args.room));
                        break;
                    default:
                        this.logger.log("join: undefined error");
                }
            });
    }

    @SubscribeMessage("leave")
    async leave(@ConnectedSocket() client: Socket, @MessageBody() args: RoomDTO) {
        this.chatService.leave(args.nickname, args.room)
            .then(async (resolve: boolean) => {
                if (client.rooms.has(args.room)) {
                    client.leave(args.room);
                    client.broadcast.to(args.room).emit("receiveInfo", Responses.userLeft(args.nickname, args.room));
                }
                client.emit("leftRoom", args.room);
                if (resolve) {
                    client.to(args.room).emit("receiveInfo", Responses.founderLeftChannel(args.room));
                    client.to(args.room).emit("leftRoom", args.room);
                }
            });
    }

    @SubscribeMessage("kick")
    async kick(@ConnectedSocket() client: Socket, @MessageBody() args: RoomRestrictionDTO) {
        this.chatService.kick(args.nickname, args.target, args.room)
            .then(() => {
                const targetSocket: Socket = this.clientList.get(args.target);

                if (targetSocket !== undefined && targetSocket.connected === true) {
                    targetSocket.leave(args.room);
                    targetSocket.emit("leftRoom", args.room);
                    targetSocket.emit("receiveInfo", Responses.youGotKicked(args.nickname, args.room, args.reason));
                }
                this.server.to(args.room).emit("receiveInfo", Responses.userGotKicked(args.nickname, args.target, args.room, args.reason));
            })
            .catch((error: ChatErrors) => {
                switch (error) {
                    case ChatErrors.AUTOTARGET:
                        client.emit("receiveInfo", Responses.autoTarget());
                        break;
                    case ChatErrors.NOSUCHCHANNEL:
                        client.emit("receiveInfo", Responses.noSuchChannel(args.room));
                        break;
                    case ChatErrors.NOTOP:
                        client.emit("receiveInfo", Responses.permissionDenied("OPERATOR"));
                        break;
                    case ChatErrors.TARGETNOTFOUND:
                        client.emit("receiveInfo", Responses.targetNotFound(args.target));
                        break;
                    case ChatErrors.NOTFOUNDER:
                        client.emit("receiveInfo", Responses.permissionDenied("FOUNDER"));
                    default:
                        this.logger.log("kick: undefined error");
                }
            });
    }

    @SubscribeMessage("banlist")
    async banlist(@ConnectedSocket() client: Socket, @MessageBody() args: RoomDTO) {
        this.chatService.getBanlist(args.nickname, args.room)
            .then((resolve: Ban[]) => {
                const banList: string[] = [];
                resolve.forEach((ban: Ban) => {
                    banList.push(ban.user.nickname);
                });
                client.emit("receiveInfo", Responses.getBanlist(banList));
            })
            .catch((error: ChatErrors) => {
                switch (error) {
                    case ChatErrors.NOSUCHCHANNEL:
                        client.emit("receiveInfo", Responses.noSuchChannel(args.room));
                        break;
                    case ChatErrors.NOTOP:
                        client.emit("receiveInfo", Responses.permissionDenied("OPERATOR"));
                        break;
                    default:
                        this.logger.log("banList: undefined error");
                }
            });
    }

    @SubscribeMessage("mute")
    async mute(@ConnectedSocket() client: Socket, @MessageBody() args: RoomRestrictionDTO) {
        this.chatService.mute(args.nickname, args.target, args.room, args.time)
            .then(() => {
                this.server.to(args.room).emit("receiveInfo", Responses.userGotMuted(args.nickname, args.target, args.reason));
            })
            .catch((error: ChatErrors) => {
                switch (error) {
                    case ChatErrors.AUTOTARGET:
                        client.emit("receiveInfo", Responses.autoTarget());
                        break;
                    case ChatErrors.NOSUCHCHANNEL:
                        client.emit("receiveInfo", Responses.noSuchChannel(args.room));
                        break;
                    case ChatErrors.TARGETNOTFOUND:
                        client.emit("receiveInfo", Responses.targetNotFound(args.target));
                        break;
                    case ChatErrors.ALREADYMUTED:
                        client.emit("receiveInfo", Responses.userAlreadyMuted(args.room, args.target));
                        break;
                    case ChatErrors.NOTOP:
                        client.emit("receiveInfo", Responses.permissionDenied("OPERATOR"));
                        break;
                    case ChatErrors.NOTFOUNDER:
                        client.emit("receiveInfo", Responses.permissionDenied("FOUNDER"));
                        break;
                    default:
                        this.logger.log("mute: undefined error");
                }
            });
    }

    @SubscribeMessage("unmute")
    async unmute(@ConnectedSocket() client: Socket, @MessageBody() args: TargetInRoomDTO) {
        this.chatService.unmute(args.nickname, args.target, args.room)
            .then(() => {
                const targetSocket: Socket = this.clientList.get(args.target);
                if (targetSocket != undefined && targetSocket.connected === true) {
                    targetSocket.emit("receiveInfo", Responses.youGotUnmuted(args.nickname, args.room));
                }
            })
            .catch((error: ChatErrors) => {
                switch (error) {
                    case ChatErrors.AUTOTARGET:
                        client.emit("receiveInfo", Responses.autoTarget());
                        break;
                    case ChatErrors.NOSUCHCHANNEL:
                        client.emit("receiveInfo", Responses.noSuchChannel(args.room));
                        break;
                    case ChatErrors.TARGETNOTFOUND:
                        client.emit("receiveInfo", Responses.targetNotFound(args.target));
                        break;
                    case ChatErrors.NOTOP:
                        client.emit("receiveInfo", Responses.permissionDenied("OPERATOR"));
                        break;
                    case ChatErrors.NOTMUTED:
                        client.emit("receiveInfo", Responses.notMutted(args.target));
                        break;
                    default:
                        this.logger.log("unmute: undefined error");
                }
            });
    }

    //TODO throw error if nickname === target, or if target is already banned from this chnanel
    @SubscribeMessage("ban")
    async ban(@ConnectedSocket() client: Socket, @MessageBody() args: RoomRestrictionDTO) {
        this.chatService.ban(args.nickname, args.target, args.room, args.time)
            .then(() => {
                const targetSocket: Socket = this.clientList.get(args.target);

                if (targetSocket !== undefined && targetSocket.connected === true) {
                    targetSocket.leave(args.room);
                    targetSocket.emit("leftRoom", args.room);
                    targetSocket.emit("receiveInfo", Responses.youGotBanned(args.nickname, args.room, args.reason));
                }
                this.server.to(args.room).emit("receiveInfo", Responses.userGotBanned(args.nickname, args.target, args.reason));
            })
            .catch((error: ChatErrors) => {
                switch (error) {
                    case ChatErrors.AUTOTARGET:
                        client.emit("receiveInfo", Responses.autoTarget());
                        break;
                    case ChatErrors.NOSUCHCHANNEL:
                        client.emit("receiveInfo", Responses.noSuchChannel(args.room));
                        break;
                    case ChatErrors.NOTOP:
                        client.emit("receiveInfo", Responses.permissionDenied("OPERATOR"));
                        break;
                    case ChatErrors.TARGETNOTFOUND:
                        client.emit("receiveInfo", Responses.targetNotFound(args.target));
                        break;
                    case ChatErrors.ALREADYBANNED:
                        client.emit("receiveInfo", Responses.userAlreadyBanned(args.room, args.target));
                        break;
                    case ChatErrors.NOTFOUNDER:
                        client.emit("receiveInfo", Responses.permissionDenied("FOUNDER"));
                        break;
                    default:
                        this.logger.log("ban: undefined error");
                }
            });
    }

    @SubscribeMessage("unban")
    async unban(@ConnectedSocket() client: Socket, @MessageBody() args: TargetInRoomDTO) {
        this.chatService.unban(args.nickname, args.target, args.room)
            .then(() => {
                const targetSocket: Socket = this.clientList.get(args.target);

                if (targetSocket !== undefined && targetSocket.connected === true) {
                    targetSocket.emit("receiveInfo", Responses.youGotUnbanned(args.nickname, args.room));
                }
            })
            .catch((error: ChatErrors) => {
                switch (error) {
                    case ChatErrors.AUTOTARGET:
                        client.emit("receiveInfo", Responses.autoTarget());
                        break;
                    case ChatErrors.NOSUCHCHANNEL:
                        client.emit("receiveInfo", Responses.noSuchChannel(args.room));
                        break;
                    case ChatErrors.NOTOP:
                        client.emit("receiveInfo", Responses.permissionDenied("OPERATOR"));
                        break;
                    case ChatErrors.TARGETNOTFOUND:
                        client.emit("receiveInfo", Responses.targetNotFound(args.target));
                        break;
                    case ChatErrors.NOTBANNED:
                        client.emit("receiveInfo", Responses.notBanned(args.target));
                        break;
                    case ChatErrors.NOTFOUNDER:
                        client.emit("receiveInfo", Responses.permissionDenied("FOUNDER"));
                        break;
                    default:
                        this.logger.log("unban: undefined error");
                }
            });
    }

    @SubscribeMessage("setPassword")
    async setPassword(@ConnectedSocket() client: Socket, @MessageBody() args: RoomSettingsDTO) {
        this.chatService.setPassword(args.nickname, args.room, args.setting)
            .then(() => {
                client.emit("receiveInfo", Responses.passwordChanged(args.room));
            })
            .catch((error: ChatErrors) => {
                switch (error) {
                    case ChatErrors.NOSUCHCHANNEL:
                        client.emit("receiveInfo", Responses.noSuchChannel(args.room));
                        break;
                    case ChatErrors.NOTFOUNDER:
                        client.emit("receiveInfo", Responses.permissionDenied("FOUNDER"));
                        break;
                    default:
                        this.logger.log("setPassword: undefined error");
                }
            });
    }

    @SubscribeMessage("setPrivacy")
    async setPrivacy(@ConnectedSocket() client: Socket, @MessageBody() args: RoomSettingsDTO) {
        this.chatService.setPrivacy(args.nickname, args.room, args.setting)
            .then((setting: string) => {
                this.server.to(args.room).emit("receiveInfo", Responses.privacyChanged(args.nickname, args.room, setting));
            })
            .catch((error: ChatErrors) => {
                switch (error) {
                    case ChatErrors.NOSUCHCHANNEL:
                        client.emit("receiveInfo", Responses.noSuchChannel(args.room));
                        break;
                    case ChatErrors.NOTOP:
                        client.emit("receiveInfo", Responses.permissionDenied("OPERATOR"));
                        break;
                    default:
                        this.logger.log("setPrivacy: undefined error");
                }
            });
    }

    @SubscribeMessage("setTopic")
    async setTopic(@ConnectedSocket() client: Socket, @MessageBody() args: RoomSettingsDTO) {
        this.chatService.setTopic(args.nickname, args.room, args.setting)
            .then((resolve: string) => {
                this.server.to(args.room).emit("updatedTopic", { name: args.room, topic: resolve });
                this.server.to(args.room).emit("receiveInfo", Responses.topicChanged(args.nickname, args.room));
            })
            .catch((error: ChatErrors) => {
                switch (error) {
                    case ChatErrors.NOSUCHCHANNEL:
                        client.emit("receiveInfo", Responses.noSuchChannel(args.room));
                        break;
                    case ChatErrors.NOTOP:
                        client.emit("receiveInfo", Responses.permissionDenied("OPERATOR"));
                        break;
                    case ChatErrors.TOPICFORBIDDENCHAR:
                        client.emit("receiveInfo", Responses.channelTopicForbiddenChar());
                        break;
                    case ChatErrors.TOPICTOOBIG:
                        client.emit("receiveInfo", Responses.channelTopicTooBig());
                        break;
                    case ChatErrors.TOPICNOALNUM:
                        client.emit("receiveInfo", Responses.channelTopicNoAlnum());
                        break;
                    default:
                        this.logger.log("setTopic: undefined error");
                }
            });
    }

    @SubscribeMessage("addOperator")
    async addOperator(@ConnectedSocket() client: Socket, @MessageBody() args: TargetInRoomDTO) {
        this.chatService.addOperator(args.nickname, args.target, args.room)
            .then(() => {
                this.server.to(args.room).emit("receiveInfo", Responses.userGotPromoted(args.nickname, args.target, args.room, "OPERATOR"));
            })
            .catch((error: ChatErrors) => {
                switch (error) {
                    case ChatErrors.AUTOTARGET:
                        client.emit("receiveInfo", Responses.autoTarget());
                        break;
                    case ChatErrors.NOSUCHCHANNEL:
                        client.emit("receiveInfo", Responses.noSuchChannel(args.room));
                        break;
                    case ChatErrors.TARGETNOTFOUND:
                        client.emit("receiveInfo", Responses.targetNotFound(args.target));
                        break;
                    case ChatErrors.NOTFOUNDER:
                        client.emit("receiveInfo", Responses.permissionDenied("FOUNDER"));
                        break;
                    default:
                        this.logger.log("addOperator: undefined error");
                }
            });
    }

    @SubscribeMessage("removeOperator")
    async removeOperator(@ConnectedSocket() client: Socket, @MessageBody() args: TargetInRoomDTO) {
        this.chatService.removeOperator(args.nickname, args.target, args.room)
            .then(() => {
                this.server.to(args.room).emit("receiveInfo", Responses.userGotDemoted(args.nickname, args.target, args.room, "OPERATOR"));
            })
            .catch((error: ChatErrors) => {
                switch (error) {
                    case ChatErrors.AUTOTARGET:
                        client.emit("receiveInfo", Responses.autoTarget());
                        break;
                    case ChatErrors.NOSUCHCHANNEL:
                        client.emit("receiveInfo", Responses.noSuchChannel(args.room));
                        break;
                    case ChatErrors.TARGETNOTFOUND:
                        client.emit("receiveInfo", Responses.targetNotFound(args.target));
                        break;
                    case ChatErrors.NOTFOUNDER:
                        client.emit("receiveInfo", Responses.permissionDenied("FOUNDER"));
                        break;
                    default:
                        this.logger.log("removeOperator: undefined error");
                }
            });
    }

    @SubscribeMessage("inviteList")
    async inviteList(@ConnectedSocket() client: Socket, @MessageBody() args: RoomDTO) {
        this.chatService.getInviteList(args.nickname, args.room)
            .then((resolve: User[]) => {
                const banList: string[] = [];
                resolve.forEach((user: User) => {
                    banList.push(user.nickname);
                });
                client.emit("receiveInfo", Responses.getInviteList(banList));
            })
            .catch((error: ChatErrors) => {
                switch (error) {
                    case ChatErrors.NOSUCHCHANNEL:
                        client.emit("receiveInfo", Responses.noSuchChannel(args.room));
                        break;
                    case ChatErrors.NOTOP:
                        client.emit("receiveInfo", Responses.permissionDenied("OPERATOR"));
                        break;
                    default:
                        this.logger.log("inviteList: undefined error");
                }
            });
    }

    @SubscribeMessage("invite")
    async invite(@ConnectedSocket() client: Socket, @MessageBody() args: TargetInRoomDTO) {
        this.chatService.invite(args.nickname, args.target, args.room)
            .then(() => {
                const targetSocket: Socket = this.clientList.get(args.target);

                if (targetSocket !== undefined && targetSocket.connected) {
                    targetSocket.emit("receiveInfo", Responses.youGotInvited(args.nickname, args.room));
                }
            })
            .catch((error: ChatErrors) => {
                switch (error) {
                    case ChatErrors.AUTOTARGET:
                        client.emit("receiveInfo", Responses.autoTarget());
                        break;
                    case ChatErrors.NOSUCHCHANNEL:
                        client.emit("receiveInfo", Responses.noSuchChannel(args.room));
                        break;
                    case ChatErrors.TARGETNOTFOUND:
                        client.emit("receiveInfo", Responses.targetNotFound(args.target));
                        break;
                    case ChatErrors.NOTOP:
                        client.emit("receiveInfo", Responses.permissionDenied("OPERATOR"));
                        break;
                    case ChatErrors.NOTINVITED:
                        client.emit("receiveInfo", Responses.userAlreadyInvited(args.target));
                        break;
                    case ChatErrors.ALREADYINCHAN:
                        client.emit("receiveInfo", Responses.userAlreadyInChannel(args.target, args.room));
                        break;
                    default:
                        this.logger.log("removeOperator: undefined error");
                }
            });
    }

    @SubscribeMessage("addFriend")
    async addFriend(@ConnectedSocket() client: Socket, @MessageBody() args: TargetDTO) {
        this.chatService.addFriend(args.nickname, args.target)
            .then(() => {
                const targetSocket: Socket = this.clientList.get(args.target);

                client.emit("addedFriend", { nickname: args.target, status: FriendStatus.PENDING });
                if (targetSocket !== undefined && targetSocket.connected) {
                    targetSocket.emit("addedFriend", { nickname: args.nickname, status: FriendStatus.INCOMING });
                }
            })
            .catch((error: ChatErrors) => {
                switch (error) {
                    case ChatErrors.TARGETNOTFOUND:
                        client.emit("receiveInfo", Responses.targetNotFound(args.target));
                        break;
                    case ChatErrors.ALREADYFRIENDS:
                        client.emit("receiveInfo", Responses.alreadyFriends(args.target));
                        break;
                    case ChatErrors.AUTOTARGET:
                        client.emit("receiveInfo", Responses.autoTarget());
                        break;
                    case ChatErrors.BLOCKED:
                        client.emit("receiveInfo", Responses.cannotAddBlocked(args.target));
                        break;
                    default:
                        this.logger.log("addFriend: undefined error");
                }
            });
    }

    @SubscribeMessage("removeFriend")
    async removeFriend(@ConnectedSocket() client: Socket, @MessageBody() args: TargetDTO) {
        this.chatService.removeFriend(args.nickname, args.target)
            .then(() => {
                const targetSocket: Socket = this.clientList.get(args.target);

                client.emit("removedFriend", args.target);
                if (targetSocket !== undefined && targetSocket.connected) {
                    targetSocket.emit("removedFriend", args.nickname);
                }
            })
            .catch((error: ChatErrors) => {
                switch (error) {
                    case ChatErrors.TARGETNOTFOUND:
                        client.emit("receiveInfo", Responses.targetNotFound(args.target));
                        break;
                    case ChatErrors.NOTFRIENDS:
                        client.emit("receiveInfo", Responses.notFriends(args.target));
                        break;
                    default:
                        this.logger.log("removeFriend: undefined error");
                }
            });
    }

    @SubscribeMessage("acceptFriend")
    async acceptFriend(@ConnectedSocket() client: Socket, @MessageBody() args: TargetDTO) {
        this.chatService.acceptFriend(args.nickname, args.target)
            .then(async () => {
                // await this.chatService.acceptFriend(args.nickname, args.target);
                const targetSocket: Socket = this.clientList.get(args.target);

                client.emit("updateFriends", await this.chatService.getFriendList(args.nickname));
                if (targetSocket !== undefined && targetSocket.connected) {
                    targetSocket.emit("updateFriends", await this.chatService.getFriendList(args.target));
                }
            })
            .catch((error: ChatErrors) => {
                switch (error) {
                    case ChatErrors.TARGETNOTFOUND:
                        client.emit("receiveInfo", Responses.targetNotFound(args.target));
                        break;
                    case ChatErrors.NOTFRIENDS:
                        client.emit("receiveInfo", Responses.notFriends(args.target));
                        break;
                    default:
                        this.logger.log("acceptFriend: undefined error");
                }
            });
    }

    @SubscribeMessage("block")
    async blockUser(@ConnectedSocket() client: Socket, @MessageBody() args: TargetDTO) {
        this.chatService.blockUser(args.nickname, args.target)
            .then(() => {
            })
            .catch((error: ChatErrors) => {
                switch (error) {
                    case ChatErrors.TARGETNOTFOUND:
                        client.emit("receiveInfo", Responses.targetNotFound(args.target));
                        break;
                    case ChatErrors.ALREADYBLOCKED:
                        client.emit("receiveInfo", Responses.alreadyBlocked(args.target));
                        break;
                    default:
                        this.logger.log("blockUser: undefined error");
                }
            });
    }

    @SubscribeMessage("unblock")
    async unblockUser(@ConnectedSocket() client: Socket, @MessageBody() args: TargetDTO) {
        this.chatService.unblockUser(args.nickname, args.target)
            .catch((error: ChatErrors) => {
                switch (error) {
                    case ChatErrors.TARGETNOTFOUND:
                        client.emit("receiveInfo", Responses.targetNotFound(args.target));
                        break;
                    case ChatErrors.NOTBLOCKED:
                        client.emit("receiveInfo", Responses.notBlocked(args.target));
                        break;
                    default:
                        this.logger.log("unblockUser: undefined error");
                }
            });
    }

    @SubscribeMessage("inviteToPong")
    inviteToPong(
        @ConnectedSocket() client: Socket,
        @MessageBody() args: TargetDTO) {
        const targetSocket: Socket = this.clientList.get(args.target);

        if (targetSocket && targetSocket.connected) {
            targetSocket.emit("receiveInfo", Responses.invitedToPong(args.nickname));
            return (this.chatService.inviteToPong(args.nickname, args.target));
        }
        client.emit("receiveInfo", Responses.cannotPlayDisconnected(args.target));
        return (undefined);
        // const ret = this.chatService.inviteToPong(args.nickname, args.target);
    }
}
