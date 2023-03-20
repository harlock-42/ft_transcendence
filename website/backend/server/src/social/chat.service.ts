import {
    ForbiddenException,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { Socket } from 'socket.io';
import { UsersService } from 'src/database/users/services/users.service';
import { ChannelsService } from '../database/channel/channels.service';
import { MessagesService } from '../database/message/messages.service';
import { PrivateMessageService } from 'src/database/privateMessage/privateMessage.service';
import { MessageBox } from 'src/database/messageBox/messageBox.entity';
import { FriendService } from 'src/database/friend/friend.service';
import { FriendStatus } from 'src/database/friend/friend.entity';
import { Channel } from 'src/database/channel/channel.entity';
import { GameService } from 'src/game/game.service';
import { RequestGame } from 'src/game/lib/ClassesForWebsocket';
import { ChatErrors } from './lib/chat.errors';
import { BanService } from 'src/database/ban/ban.service';
import { Ban } from 'src/database/ban/ban.entity';
import { MuteService } from 'src/database/mute/mute.service';
import { User } from 'src/database/users/entities/users.entity';
import { BlockService } from 'src/database/block/block.service';
import { ChannelDTO, MessageDTO } from './dto/gateway.dtos';
import { Message } from 'src/database/message/message.entity';
import { Room, RoomType } from './lib/chat.types';
import { PrivateMessage } from 'src/database/privateMessage/privateMessage.entity';
import { FileManager } from './lib/FileManager';
import { isAlphanumeric } from 'class-validator';
import { MessageBoxService } from 'src/database/messageBox/messageBox.service';

const CHANNEL_NAME_MAX_LENGTH = 15;
const CHANNEL_TOPIC_MAX_LENGTH = 50;
const MESSAGE_MAX_LENGTH = 100;

@Injectable()
export class ChatService {
    constructor(
        public userService: UsersService,
        private channelService: ChannelsService,
        private messageService: MessagesService,
        private privateMessageService: PrivateMessageService,
        private messageBoxService: MessageBoxService,
        private friendService: FriendService,
        private gameService: GameService,
        private banService: BanService,
        private muteService: MuteService,
        private blockService: BlockService,
    ) { }

    private logger: Logger = new Logger('Chat service');

    async initChannels(client: Socket, nickname: string): Promise<Room[]> {
        const user: User = await this.userService.getOneByNickname(nickname, {
            channels: true,
        });
        if (!user.channels) {
            return [];
        }
        const channelList: Room[] = [];

        user.channels.forEach((channel: Channel) => {
            client.join(channel.name);
            channelList.push({
                name: channel.name,
                topic: channel.topic,
                imagePath: channel.imgPath,
            });
        });
        return channelList;
    }

    async initPms(client: Socket, nickname: string): Promise<string[]> {
        const user: User = await this.userService.getOneByNickname(nickname, {
            privateMsg: true,
        });
        if (!user.privateMsg) {
            return [];
        }
        const pmList: string[] = [];

        user.privateMsg.forEach((pm: PrivateMessage) => {
            pmList.push(pm.user.nickname);
        });
        return pmList;
    }

    async getFriendList(
        nickname: string,
    ): Promise<{ nickname: string; status: FriendStatus }[]> {
        const user: User = await this.userService.getOneByNickname(nickname, {
            friends: true,
        });
        if (!user.friends) {
            return [];
        }
        const friendList: { nickname: string; status: FriendStatus }[] = [];

        for (let i = 0; i < user.friends.length; ++i) {
            friendList.push({
                nickname: (await this.userService.getOneById(user.friends[i].friendId))
                    .nickname,
                status: user.friends[i].status,
            });
        }
        return friendList;
    }

    async getRelationInfos(
        nickname: string,
        target: string,
    ): Promise<{ isFriend: boolean; isBlocked: boolean }> {
        const user: User = await this.userService.getOneByNickname(nickname, {
            friends: true,
            blockList: true,
        });
        const targetUser = await this.userService.getOneByNickname(target);
        const isFriend: boolean = this.userService.checkFriendship(
            user,
            targetUser.id,
        ) ? true : false;
        const isBlocked: boolean = this.userService.isBlocked(user, targetUser);
        return { isFriend: isFriend, isBlocked: isBlocked };
    }

    async isConnected(nickname: string): Promise<boolean> {
        return await this.userService.isExist(nickname);
    }

    async getPublicChannels(filter?: string): Promise<Room[]> {
        const channels: Channel[] = await this.channelService.getAll();
        const channelList: Room[] = [];
        channels.forEach((channel: Channel) => {
            if (
                !channel.isPrivate &&
                (!filter || channel.name.substring(0, filter.length) === filter)
            ) {
                channelList.push({
                    name: channel.name,
                    topic: channel.topic,
                    imagePath: channel.imgPath,
                    hasPassword: channel.password ? true : false,
                });
            }
        });
        return channelList;
    }

    async getChannelInvites(nickname: string): Promise<Room[]> {
        const channels: Channel[] = await this.channelService.getAll();
        const channelList: Room[] = [];
        channels.forEach((channel: Channel) => {
            channel.inviteList.forEach((user: User) => {
                if (user.nickname === nickname) {
                    channelList.push({
                        name: channel.name,
                        topic: channel.topic,
                        imagePath: channel.imgPath,
                        hasPassword: channel.password ? true : false,
                    });
                }
            });
        });
        return channelList;
    }

    async getUsers(filter?: string): Promise<string[]> {
        const users: User[] = await this.userService.getAll();
        const userList: string[] = [];
        users.forEach((user: User) => {
            if (
                !filter ||
                (user.nickname.length >= filter.length &&
                    user.nickname.substring(0, filter.length) === filter)
            ) {
                userList.push(user.nickname);
            }
        });
        return userList;
    }

    async getUsersInChannel(
        channelName: string,
        filter?: string,
    ): Promise<string[]> {
        const channel: Channel = await this.channelService.getOneByName(
            channelName,
            {
                users: true,
            },
        );
        const userList: string[] = [];
        if (channel && channel.users) {
            channel.users.forEach((user: User) => {
                if (
                    !filter ||
                    (user.nickname.length >= filter.length &&
                        user.nickname.substring(0, filter.length) === filter)
                ) {
                    userList.push(user.nickname);
                }
            });
        }
        return userList;
    }

    async getAllInChannel(channelName: string): Promise<MessageDTO[]> {
        const messageArr: MessageDTO[] = [];

        (await this.channelService.getMsgByChanName(channelName)).forEach(
            (message: Message) => {
                messageArr.push({
                    text: message.text,
                    date: message.date,
                    senderNickname: message.owner.nickname,
                    target: {
                        type: RoomType.CHANNEL,
                        room: {
                            name: message.channel.name,
                        },
                    },
                });
            },
        );
        return messageArr;
    }

    async getAllInPms(nickname: string, targetName: string) {
        const user: User = await this.userService.getOneByNickname(nickname, {
            privateMsg: true,
        });
        const target: User = await this.userService.getOneByNickname(targetName);
        const messageArr: MessageDTO[] = [];

        const privateMessage: PrivateMessage =
            await this.privateMessageService.getOneByTarget(user, target, {
                box: {
                    messages: {
                        owner: true,
                    },
                },
            });
        if (privateMessage && privateMessage.box && privateMessage.box.messages) {
            privateMessage.box.messages.forEach((message: Message) => {
                messageArr.push({
                    text: message.text,
                    date: message.date,
                    senderNickname: message.owner.nickname,
                    target: {
                        type: RoomType.PM,
                        // name: message.nickname
                        room: {
                            name: message.owner.nickname,
                        },
                    },
                });
            });
        }
        return messageArr;
    }

    parseChannelName(channelName: string): string {
        channelName = channelName.split(' ').join(' ');
        if (channelName.length > CHANNEL_NAME_MAX_LENGTH) {
            throw ChatErrors.NAMETOOBIG;
        }

        let alnumCheck = false;
        for (let i = 0; i < channelName.length; ++i) {
            if (
                !isAlphanumeric(channelName[i]) &&
                channelName[i] != '-' &&
                channelName[i] != '_' &&
                channelName[i] != ' '
            ) {
                throw ChatErrors.NAMEFORBIDDENCHAR;
            } else if (!alnumCheck && isAlphanumeric(channelName[i])) {
                alnumCheck = true;
            }
        }
        if (!alnumCheck) {
            throw ChatErrors.NAMENOALNUM;
        }
        return channelName;
    }

    parseChannelTopic(channelTopic: string): string {
        channelTopic = channelTopic.split(' ').join(' ');
        if (channelTopic.length > CHANNEL_TOPIC_MAX_LENGTH) {
            throw ChatErrors.TOPICTOOBIG;
        }

        let alnumCheck = false;
        for (let i = 0; i < channelTopic.length; ++i) {
            if (
                !isAlphanumeric(channelTopic[i]) &&
                channelTopic[i] != '-' &&
                channelTopic[i] != '_' &&
                channelTopic[i] != ' '
            ) {
                throw ChatErrors.TOPICFORBIDDENCHAR;
            } else if (!alnumCheck && isAlphanumeric(channelTopic[i])) {
                alnumCheck = true;
            }
        }
        if (!alnumCheck) {
            throw ChatErrors.TOPICNOALNUM;
        }
        return channelTopic;
    }

    async createChannel(channelDto: ChannelDTO): Promise<Room> {
        if (await this.channelService.getOneByName(channelDto.channelName)) {
            throw ChatErrors.ALREADYEXIST;
        }
        channelDto.channelName = this.parseChannelName(channelDto.channelName);
        channelDto.topic &&
            (channelDto.topic = this.parseChannelTopic(channelDto.topic));

        const user = await this.userService.getOneByNickname(channelDto.nickname, {
            channels: true,
        });
        const channel = await this.channelService.create(
            channelDto.channelName,
            user,
        );
        let filePath: string = undefined;
        channelDto.topic && (await this.channelService.setTopic(channel, channelDto.topic));
        channelDto.isPublic && (await this.channelService.setPublic(channel));
        channelDto.password && (await this.channelService.setPassword(channel, channelDto.password));
        if (channelDto.image) {
            if (!FileManager.checkFileType(channelDto.image.type, ['image/jpg', 'image/jpeg', 'image/png'])) {
                throw ChatErrors.BADIMAGETYPE;
            }
            const fullFilePath = FileManager.getFullFilePath(
                channelDto.channelName,
                channelDto.image.type,
            );
            filePath = FileManager.getFilePath(
                channelDto.channelName,
                channelDto.image.type,
            );
            await FileManager.createFile(fullFilePath, channelDto.image.file);
            await this.channelService.setImagePath(channel, filePath);
        }
        await this.userService.addChannel(user, channel);
        return {
            name: channelDto.channelName,
            topic: channelDto.topic,
            imagePath: filePath,
        };
    }

    async join(
        nickname: string,
        channelName: string,
        password: string,
    ): Promise<Room> {
        const user = await this.userService.getOneByNickname(nickname, {
            channels: true,
        });
        const channel = await this.channelService.getOneByName(channelName, {
            users: true,
            banList: true,
            inviteList: true,
        });
        if (!channel) {
            throw ChatErrors.NOSUCHCHANNEL;
        } else if (this.channelService.getUser(channel, user)) {
            throw ChatErrors.ALREADYINCHAN;
        } else if (await this.channelService.isBanned(channel, user)) {
            throw ChatErrors.BANNED;
        } //TODO isPrivate with type Channel insteed of string
        else if (
            channel.isPrivate &&
            !this.channelService.isInvited(user, channel)
        ) {
            throw ChatErrors.NOTINVITED;
        } else if (
            channel.password &&
            !this.channelService.isInvited(user, channel) &&
            !(await this.channelService.checkPassword(channel, password))
        ) {
            throw ChatErrors.BADPASSWORD;
        }
        if (this.channelService.isInvited(user, channel)) {
            await this.channelService.removeUserFromInviteList(user, channel);
        }
        await this.userService.addChannel(user, channel);
        return {
            name: channel.name,
            topic: channel.topic,
            imagePath: channel.imgPath,
        };
    }

    async clearUsers() {
        this.userService.clear();
    }

    // channels

    async removeOneChannel(channelName: string) {
        const channel: Channel = await this.channelService.getOneByName(
            channelName,
            {
                messages: true,
                banList: true,
                muteList: true,
            },
        );

        if (!channel) {
            return undefined;
        }
        for (const msg of channel.messages) {
            await this.messageService.removeById(msg.id);
        }
        for (const ban of channel.banList) {
            await this.banService.removeOne(ban);
        }
        for (const mute of channel.muteList) {
            await this.muteService.removeOne(mute);
        }
        await this.channelService.removeById(channel.id);
    }

    async leave(nickname: string, channelName: string) {
        const user = await this.userService.getOneByNickname(nickname, {
            channels: true,
        });

        if (!user) {
            return undefined;
        }
        this.userService.removeChannel(user, channelName); // kick the user from the channel
        let channel = await this.channelService.getOneByName(channelName, {
            users: true,
            founder: true,
        });
        if (!channel) {
            return undefined;
        }
        channel = await this.channelService.kickUser(channel, nickname);
        if (channel) {
            if (this.channelService.isFounder(channel, user)) {
                this.removeOneChannel(channelName); // delete the channel if there no user inside
                if (channel.imgPath) {
                    FileManager.removeFile(channel.imgPath);
                }
                return true;
            }
        }
        return false;
    }

    async kick(nickname: string, target: string, channelName: string) {
        if (nickname === target) {
            throw ChatErrors.AUTOTARGET;
        }

        const user = await this.userService.getOneByNickname(nickname);
        const targetUser = await this.userService.getOneByNickname(target);
        const channel = await this.channelService.getOneByName(channelName, {
            users: true,
            operators: true,
            founder: true,
        });

        if (!channel) {
            throw ChatErrors.NOSUCHCHANNEL;
        } else if (!this.channelService.isOperator(channel, user)) {
            throw ChatErrors.NOTOP;
        } else if (
            !targetUser ||
            !this.channelService.getUser(channel, targetUser)
        ) {
            throw ChatErrors.TARGETNOTFOUND;
        } else if (
            this.channelService.isOperator(channel, targetUser) &&
            !this.channelService.isFounder(channel, user)
        ) {
            throw ChatErrors.NOTFOUNDER;
        }
        return await this.leave(target, channelName);
    }

    async setPassword(nickname: string, channelName: string, password: string) {
        const user = await this.userService.getOneByNickname(nickname);
        const channel = await this.channelService.getOneByName(channelName, {
            founder: true,
        });

        if (!channel) {
            throw ChatErrors.NOSUCHCHANNEL;
        } else if (!this.channelService.isFounder(channel, user)) {
            throw ChatErrors.NOTFOUNDER;
        }
        await this.channelService.setPassword(channel, password);
    }

    async setPrivacy(
        nickname: string,
        channelName: string,
        setting: string,
    ): Promise<string> {
        const user = await this.userService.getOneByNickname(nickname);
        const channel = await this.channelService.getOneByName(channelName, {
            operators: true,
        });

        if (!channel) {
            throw ChatErrors.NOSUCHCHANNEL;
        }
        if (!this.channelService.isOperator(channel, user)) {
            throw ChatErrors.NOTOP;
        }
        if (setting === 'public' && channel.isPrivate) {
            await this.channelService.setPublic(channel);
        } else if (setting === 'private' && !channel.isPrivate) {
            await this.channelService.setPrivate(channel);
        }
        return setting;
    }

    async setTopic(
        nickname: string,
        channelName: string,
        topic: string,
    ): Promise<string> {
        topic = this.parseChannelTopic(topic);

        const user = await this.userService.getOneByNickname(nickname);
        const channel = await this.channelService.getOneByName(channelName, {
            operators: true,
        });

        if (!channel) {
            throw ChatErrors.NOSUCHCHANNEL;
        }
        if (!this.channelService.isOperator(channel, user)) {
            throw ChatErrors.NOTOP;
        }
        await this.channelService.setTopic(channel, topic);
        return topic;
    }

    async getBanlist(nickname: string, channelName: string): Promise<Ban[]> {
        const user = await this.userService.getOneByNickname(nickname);
        const channel = await this.channelService.getOneByName(channelName, {
            banList: true,
            operators: true,
        });

        if (!channel) {
            throw ChatErrors.NOSUCHCHANNEL;
        }
        if (!this.channelService.isOperator(channel, user)) {
            throw ChatErrors.NOTOP;
        }

        const banList: Ban[] = await this.channelService.getBanlist(channelName);

        if (!banList) {
            return [];
        }
        return banList;
    }

    async mute(
        nickname: string,
        target: string,
        channelName: string,
        time: number | undefined,
    ) {
        if (nickname === target) {
            throw ChatErrors.AUTOTARGET;
        }

        const user = await this.userService.getOneByNickname(nickname);
        const targetUser = await this.userService.getOneByNickname(target);
        const channel = await this.channelService.getOneByName(channelName, {
            users: true,
            muteList: true,
            operators: true,
            founder: true,
        });

        if (!channel) {
            throw ChatErrors.NOSUCHCHANNEL;
        } else if (this.channelService.isMuted(channel, targetUser)) {
            throw ChatErrors.ALREADYMUTED;
        } else if (
            !targetUser ||
            !this.channelService.getUser(channel, targetUser)
        ) {
            throw ChatErrors.TARGETNOTFOUND;
        } else if (!this.channelService.isOperator(channel, user)) {
            throw ChatErrors.NOTOP;
        } else if (
            this.channelService.isOperator(channel, targetUser) &&
            !this.channelService.isFounder(channel, user)
        ) {
            throw ChatErrors.NOTFOUNDER;
        }
        const mute = await this.muteService.create(
            targetUser,
            time ? Date.now() + time : undefined,
        );
        return await this.channelService.muteUser(channel, mute);
    }

    async unmute(nickname: string, target: string, channelName: string) {
        if (nickname === target) {
            throw ChatErrors.AUTOTARGET;
        }

        const user = await this.userService.getOneByNickname(nickname);
        const targetUser = await this.userService.getOneByNickname(target);
        const channel = await this.channelService.getOneByName(channelName, {
            users: true,
            muteList: true,
            operators: true,
        });

        if (!channel) {
            throw ChatErrors.NOSUCHCHANNEL;
        } else if (
            !targetUser ||
            !this.channelService.getUser(channel, targetUser)
        ) {
            throw ChatErrors.TARGETNOTFOUND;
        } else if (!this.channelService.isOperator(channel, user)) {
            throw ChatErrors.NOTOP;
        } else if (!this.channelService.isMuted(channel, targetUser)) {
            throw ChatErrors.NOTMUTED;
        }
        await this.muteService.removeOne(
            await this.muteService.getOne(channel, targetUser),
        );
        return await this.channelService.unmuteUser(channel, targetUser);
    }

    async ban(
        nickname: string,
        target: string,
        channelName: string,
        time: number | undefined,
    ) {
        if (nickname === target) {
            throw ChatErrors.AUTOTARGET;
        }

        const user = await this.userService.getOneByNickname(nickname);
        const targetUser = await this.userService.getOneByNickname(target);
        const channel = await this.channelService.getOneByName(channelName, {
            banList: true,
            operators: true,
            founder: true,
        });

        if (!channel) {
            throw ChatErrors.NOSUCHCHANNEL;
        } else if (!this.channelService.isOperator(channel, user)) {
            throw ChatErrors.NOTOP;
        } else if (!targetUser) {
            throw ChatErrors.TARGETNOTFOUND;
        } else if (await this.channelService.isBanned(channel, targetUser)) {
            throw ChatErrors.ALREADYBANNED;
        } else if (
            this.channelService.isOperator(channel, targetUser) &&
            !this.channelService.isFounder(channel, user)
        ) {
            throw ChatErrors.NOTFOUNDER;
        }
        const ban = await this.banService.create(
            targetUser,
            time ? Date.now() + time : undefined,
        );
        await this.channelService.banUser(channel, ban);
        return this.leave(target, channelName);
    }

    async unban(nickname: string, target: string, channelName: string) {
        if (nickname === target) {
            throw ChatErrors.AUTOTARGET;
        }

        const user = await this.userService.getOneByNickname(nickname);
        const targetUser = await this.userService.getOneByNickname(target);
        const channel = await this.channelService.getOneByName(channelName, {
            users: true,
            banList: true,
            operators: true,
            founder: true,
        });

        if (!channel) {
            throw ChatErrors.NOSUCHCHANNEL;
        } else if (!this.channelService.isOperator(channel, user)) {
            throw ChatErrors.NOTOP;
        } else if (!targetUser) {
            throw ChatErrors.TARGETNOTFOUND;
        } else if (!(await this.channelService.isBanned(channel, targetUser))) {
            throw ChatErrors.NOTBANNED;
        } else if (
            this.channelService.isOperator(channel, targetUser) &&
            !this.channelService.isFounder(channel, user)
        ) {
            throw ChatErrors.NOTFOUNDER; //probably not needed
        }
        await this.banService.removeOne(
            await this.banService.getOne(channel, targetUser),
        );
        return await this.channelService.unbanUser(channel, targetUser);
    }

    async addOperator(nickname: string, targetName: string, channelName: string) {
        if (nickname === targetName) {
            throw ChatErrors.AUTOTARGET;
        }

        const channel = await this.channelService.getOneByName(channelName, {
            founder: true,
            operators: true,
        });
        if (!channel) {
            throw ChatErrors.NOSUCHCHANNEL;
        }
        const user = await this.userService.getOneByNickname(nickname);
        const target = await this.userService.getOneByNickname(targetName);
        if (!this.channelService.isFounder(channel, user)) {
            throw ChatErrors.NOTFOUNDER;
        } else if (!target) {
            throw ChatErrors.TARGETNOTFOUND;
        }
        return await this.channelService.addOperator(channel, target);
    }

    async removeOperator(
        nickname: string,
        targetName: string,
        channelName: string,
    ) {
        if (nickname === targetName) {
            throw ChatErrors.AUTOTARGET;
        }

        const channel = await this.channelService.getOneByName(channelName, {
            founder: true,
            operators: true,
        });
        if (!channel) {
            throw ChatErrors.NOSUCHCHANNEL;
        }
        const user = await this.userService.getOneByNickname(nickname);
        const target = await this.userService.getOneByNickname(targetName);
        if (!this.channelService.isFounder(channel, user)) {
            throw ChatErrors.NOTFOUNDER;
        }
        if (!target) {
            throw ChatErrors.TARGETNOTFOUND;
        }
        return await this.channelService.removeOperator(channel, target);
    }

    async getInviteList(nickname: string, channelName: string): Promise<User[]> {
        const user = await this.userService.getOneByNickname(nickname);
        const channel = await this.channelService.getOneByName(channelName, {
            inviteList: true,
            operators: true,
        });

        if (!channel) {
            throw ChatErrors.NOSUCHCHANNEL;
        }
        if (!this.channelService.isOperator(channel, user)) {
            throw ChatErrors.NOTOP;
        }

        const inviteList: User[] = await this.channelService.getInviteList(
            channelName,
        );

        if (!inviteList) {
            return [];
        }
        return inviteList;
    }

    async invite(nickname: string, targetName: string, channelName: string) {
        if (nickname === targetName) {
            throw ChatErrors.AUTOTARGET;
        }

        const channel = await this.channelService.getOneByName(channelName, {
            users: true,
            operators: true,
            inviteList: true,
        });
        if (!channel) {
            throw ChatErrors.NOSUCHCHANNEL;
        }
        const user = await this.userService.getOneByNickname(nickname);
        const target = await this.userService.getOneByNickname(targetName);
        if (!target) {
            throw ChatErrors.TARGETNOTFOUND;
        } else if (!this.channelService.isOperator(channel, user)) {
            throw ChatErrors.NOTOP;
        } else if (this.channelService.isInvited(target, channel)) {
            throw ChatErrors.NOTINVITED;
        } else if (this.channelService.getUser(channel, target)) {
            throw ChatErrors.ALREADYINCHAN;
        }
        return await this.channelService.addUserToInviteList(target, channel);
    }

    async cancelInvitation(
        nickname: string,
        targetName: string,
        channelName: string,
    ) {
        const channel = await this.channelService.getOneByName(channelName, {
            operators: true,
            founder: true,
            inviteList: true,
        });
        if (!channel) {
            throw new NotFoundException(
                `Channel ${channelName} not found in the database`,
            );
        }
        const user = await this.userService.getOneByNickname(nickname);
        if (!user) {
            throw new NotFoundException(`User ${nickname} not found in the database`);
        }
        const target = await this.userService.getOneByNickname(targetName);
        if (!target) {
            throw new NotFoundException(
                `User ${targetName} not found in the database`,
            );
        }
        if (
            this.channelService.isFounder(channel, user) === false &&
            this.channelService.isOperator(channel, user) === false
        ) {
            throw new ForbiddenException(
                `User ${nickname} is neither founder nor operator`,
            );
        }
        return await this.channelService.removeUserFromInviteList(target, channel);
    }

    // Messages

    async rmMsgFromChan(channelName: string) {
        const channel = await this.channelService.getOneByName(channelName, {
            messages: true,
        });

        if (!channel) {
            return undefined;
        }
        const msgs = channel.messages; //TODO fix code duplication with removeOneChannel
        for (const msg of msgs) {
            this.messageService.removeById(msg.id);
        }
    }

    async sendMessage(text: string, chanName: string, nickname: string, date) {
        if (text.length > MESSAGE_MAX_LENGTH) {
            throw ChatErrors.MESSAGETOOBIG;
        }

        const user = await this.userService.getOneByNickname(nickname);
        const chan = await this.channelService.getOneByName(chanName, {
            messages: true,
            muteList: true,
        });

        if (this.channelService.isMuted(chan, user)) {
            throw ChatErrors.MUTED;
        }
        const newMsg = await this.messageService.create(user, text, date);
        return await this.channelService.addMsg(chan, newMsg);
    }

    async createPrivateConv(nickname: string, targetName: string) {
        const user = await this.userService.getOneByNickname(nickname, {
            privateMsg: true,
        });
        const target = await this.userService.getOneByNickname(targetName);
        const privConvUser = await this.privateMessageService.getOneByTarget(
            user,
            target,
        );
        const privConvTarget = await this.privateMessageService.getOneByTarget(
            target,
            user,
            {
                box: true,
            },
        );

        if (!privConvUser) {
            const msgBox: MessageBox = privConvTarget
                ? privConvTarget.box
                : await this.messageBoxService.create();
            this.privateMessageService.create(user, target, msgBox);
        }
    }

    async closePrivateConv(nickname: string, targetName: string) {
        const user = await this.userService.getOneByNickname(nickname);
        const target = await this.userService.getOneByNickname(targetName);
        const privateConv = await this.privateMessageService.getOneByTarget(
            user,
            target,
        );
        return await this.privateMessageService.removeOne(privateConv);
    }

    async sendPrivateMessage(
        nickname: string,
        targetName: string,
        text: string,
        date: number,
    ) {
        if (text.length > MESSAGE_MAX_LENGTH) {
            throw ChatErrors.MESSAGETOOBIG;
        }

        const user = await this.userService.getOneByNickname(nickname, {
            privateMsg: true,
        });
        const target = await this.userService.getOneByNickname(targetName, {
            privateMsg: true,
            blockList: true,
        });
        if (this.userService.isBlocked(target, user)) {
            throw ChatErrors.BLOCKED;
        }
        let pmUser = await this.privateMessageService.getOneByTarget(user, target, {
            box: true,
        });
        let pmTarget = await this.privateMessageService.getOneByTarget(
            target,
            user,
            {
                box: true,
            },
        );

        const msgBox: MessageBox =
            (pmUser && pmUser.box) ||
            (pmTarget && pmTarget.box) ||
            (await this.messageBoxService.create());

        pmUser =
            pmUser || (await this.privateMessageService.create(user, target, msgBox));
        pmTarget =
            pmTarget ||
            (await this.privateMessageService.create(target, user, msgBox));
        return await this.messageBoxService.addMessage(
            msgBox,
            await this.messageService.create(user, text, date),
        );
    }

    async clearMessage() {
        this.messageService.clearAll();
    }

    /*
     ** friend list
     */

    async addFriend(nickname: string, targetName: string) {
        if (nickname === targetName) {
            throw ChatErrors.AUTOTARGET;
        }
        const user = await this.userService.getOneByNickname(nickname, {
            friends: true,
        });
        if (!user) {
            return undefined;
        }
        const target = await this.userService.getOneByNickname(targetName, {
            friends: true,
            blockList: true,
        });
        if (!target) {
            throw ChatErrors.TARGETNOTFOUND;
        } else if (this.userService.checkFriendship(user, target.id)) {
            throw ChatErrors.ALREADYFRIENDS;
        }
        if (this.userService.isBlocked(target, user)) {
            throw ChatErrors.BLOCKED;
        }
        const friendUser = await this.friendService.create(
            user.id,
            FriendStatus.INCOMING,
        );
        const friendTarget = await this.friendService.create(
            target.id,
            FriendStatus.PENDING,
        );
        await this.userService.addFriend(target, friendUser);
        await this.userService.addFriend(user, friendTarget);
    }

    async removeFriend(nickname: string, targetName: string) {
        const user = await this.userService.getOneByNickname(nickname, {
            friends: true,
        });
        if (!user) {
            return undefined;
        }
        const target = await this.userService.getOneByNickname(targetName, {
            friends: true,
        });
        if (!target) {
            throw ChatErrors.TARGETNOTFOUND;
        } else if (!this.userService.checkFriendship(user, target.id)) {
            throw ChatErrors.NOTFRIENDS;
        }

        const friendUser = user.friends.find((element) => {
            return element.friendId === target.id;
        });
        const friendTarget = target.friends.find((element) => {
            return element.friendId === user.id;
        });
        await this.friendService.removeOne(friendUser);
        await this.friendService.removeOne(friendTarget);
    }

    async acceptFriend(nickname: string, targetName: string) {
        const user = await this.userService.getOneByNickname(nickname, {
            friends: true,
        });
        if (!user) {
            return undefined;
        }
        const target = await this.userService.getOneByNickname(targetName, {
            friends: true,
        });
        if (!target) {
            throw ChatErrors.TARGETNOTFOUND;
        } else if (!this.userService.checkFriendship(user, target.id)) {
            throw ChatErrors.NOTFRIENDS;
        }
        const friendTarget = target.friends.find((element) => {
            return element.friendId === user.id;
        });
        if (!friendTarget) {
            return undefined; //TODO check this case
        }
        await this.friendService.changeStatus(friendTarget, FriendStatus.ACCEPTED);
        const friendUser = user.friends.find((element) => {
            return element.friendId === target.id;
        });
        if (!friendUser) {
            return undefined; //TODO check this case
        }
        return await this.friendService.changeStatus(
            friendUser,
            FriendStatus.ACCEPTED,
        );
    }

    async blockUser(nickname: string, target: string) {
        const user = await this.userService.getOneByNickname(nickname, {
            blockList: true,
        });
        const targetUser = await this.userService.getOneByNickname(target);

        if (!targetUser) {
            throw ChatErrors.TARGETNOTFOUND;
        } else if (this.userService.isBlocked(user, targetUser)) {
            throw ChatErrors.ALREADYBLOCKED;
        }
        const block = await this.blockService.create(targetUser.id, user);
        return await this.userService.block(user, block);
    }

    async unblockUser(nickname: string, target: string) {
        const user = await this.userService.getOneByNickname(nickname, {
            blockList: true,
        });
        const targetUser = await this.userService.getOneByNickname(target);

        if (!targetUser) {
            throw ChatErrors.TARGETNOTFOUND;
        } else if (!this.userService.isBlocked(user, targetUser)) {
            throw ChatErrors.NOTBLOCKED;
        }
        await this.userService.unblock(user, targetUser);
        return await this.blockService.removeOne(
            await this.blockService.getOne(user, targetUser),
        );
    }

    inviteToPong(nickname: string, targetName: string) {
        const friendsGameRequest: RequestGame = new RequestGame();
        friendsGameRequest.gameInfo.date = new Date();
        friendsGameRequest.gameInfo.sender = nickname;
        friendsGameRequest.gameInfo.target = targetName;
        // this.gameService.addFriendsGames(friendsGameRequest);
        return this.gameService.addRequestGame(friendsGameRequest).gameInfo;
    }
}
