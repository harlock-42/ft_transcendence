import { emit } from "process";
import { MutableRefObject } from "react";
import { Socket } from "socket.io-client";
import { FriendGameInfo } from "../../Game/lib/GameMaster";
import { ChannelForm } from "../components/CreateChannelForm";
import { RoomTarget, Message } from "./chatTypes";

export function sendChatText(socket: Socket, nickname: string, text: string, target: RoomTarget | null)
{
    if (!target) {
        return;
    }

    const message: Message = {
        text: text,
        date: Date.now(),
        senderNickname: nickname,
        target: target,
    };

    socket.emit('send', message);
}

export function createChannel(socket: Socket, channel: ChannelForm) {
    socket.emit('create', channel);
}

export function joinRoom(socket: Socket, nickname: string, room: string, password?: string) {
    socket.emit('join', {...{nickname, room, password}});
}

export function leaveRoom(socket: Socket, nickname: string, room: string) {
    socket.emit('leave', {...{nickname, room}});
}

export function kickUser(socket: Socket, nickname: string, target: string, room: string, reason: string) {
    socket.emit('kick', {...{nickname, target, room, reason}});
}

export function getBanlist(socket: Socket, nickname: string, room: string) {
    socket.emit('banlist', {...{nickname, room}});
}

export function muteUser(socket: Socket, nickname: string, target: string, room: string, reason: string) {
    socket.emit('mute', {...{nickname, target, room, reason}});
}

export function timeMuteUser(socket: Socket, nickname: string, target: string, room: string, reason: string, time: number) {
    socket.emit('mute', {...{nickname, target, room, reason, time}});  
}

export function unmuteUser(socket: Socket, nickname: string, target: string, room: string) {
    socket.emit('unmute', {...{nickname, target, room}});
}

export function banUser(socket: Socket, nickname: string, target: string, room: string, reason: string) {
    socket.emit('ban', {...{nickname, target, room, reason}});
}

export function timeBanUser(socket: Socket, nickname: string, target: string, room: string, reason: string, time: number) {
    socket.emit('ban', {...{nickname, target, room, reason, time}});
}

export function unbanUser(socket: Socket, nickname: string, target: string, room: string) {
    socket.emit('unban', {...{nickname, target, room}});
}

export function setPrivacy(socket: Socket, nickname: string, room: string, setting: string) {
    socket.emit('setPrivacy', {...{nickname, room, setting}});
}

export function setTopic(socket: Socket, nickname: string, room: string, setting: string) {
    socket.emit('setTopic', {...{nickname, room, setting}});
}

export function setPassword(socket: Socket, nickname: string, room: string, setting?: string) {
    socket.emit('setPassword', {...{nickname, room, setting}});
}

export function addOperator(socket: Socket, nickname: string, target: string, room: string) {
    socket.emit('addOperator', {...{nickname, target, room}});
}

export function removeOperator(socket: Socket, nickname: string, target: string, room: string) {
    socket.emit('removeOperator', {...{nickname, target, room}});
}

export function getInviteList(socket: Socket, nickname: string, room: string) {
    socket.emit('inviteList', {...{nickname, room}});
}

export function inviteToChan(socket: Socket, nickname: string, target: string, room: string) {
    socket.emit('invite', {...{nickname, target, room}});
}

export function addFriend(socket: Socket, nickname: string, target: string) {
    socket.emit('addFriend', {...{nickname, target}});
}

export function removeFriend(socket: Socket, nickname: string, target: string) {
    socket.emit('removeFriend', {...{nickname, target}});
}

export function acceptFriend(socket: Socket, nickname: string, target: string) {
    socket.emit('acceptFriend', {...{nickname, target}});
}

export function inviteToPong(socket: Socket, nickname: string, target: string, callback: (gameRequest: FriendGameInfo) => void) {
    socket.emit('inviteToPong', {...{nickname, target}}, callback);
}

export function blockUser(socket: Socket, nickname: string, target: string) {
    socket.emit('block', {...{nickname, target}});
}

export function unblockUser(socket: Socket, nickname: string, target: string) {
    socket.emit('unblock', {...{nickname, target}});
}

export function createPrivateConv(socket: Socket, nickname: string, target: string, callback?: () => void) {
    socket.emit('createPm', {...{nickname, target}}, callback);
}

export function closePrivateConv(socket: Socket, nickname: string, target: string) {
    socket.emit('closePm', {...{nickname, target}});
}