import { BrandingWatermark } from "@mui/icons-material";
import { Dispatch, MutableRefObject, SetStateAction, useRef } from "react";
import { Socket } from "socket.io-client";
import { addOperator, banUser, getBanlist, getInviteList, inviteToChan, joinRoom, kickUser, muteUser, removeOperator, setPassword, setPrivacy, setTopic, timeBanUser, timeMuteUser, unbanUser, unmuteUser } from "./chatQuery";
import { PopUp, RoomTarget, RoomType } from "./chatTypes";
import { ClientErrors } from "./ClientErrors";

export class ChatCLI {
    private commands: Map<string, (client: Socket, nickname: string, roomTarget: RoomTarget | null, args: string[], setPopUps: Dispatch<SetStateAction<PopUp[]>>) => void> = new Map();

    constructor() {
        this.commands.set("/join", this.join);
        this.commands.set("/leave", this.leave);
        this.commands.set("/kick", this.kick);
        this.commands.set("/banlist", this.banlist);
        this.commands.set("/timemute", this.timemute)
        this.commands.set("/mute", this.mute);
        this.commands.set("/unmute", this.unmute);
        this.commands.set("/timeban", this.timeban);
        this.commands.set("/ban", this.ban);
        this.commands.set("/unban", this.unban);
        this.commands.set("/set", this.set);
        this.commands.set("/op", this.op);
        this.commands.set("/deop", this.deop);
        this.commands.set("/invitelist", this.invitelist);
        this.commands.set("/invite", this.invite);
    }

    // parseCommand(client: Socket, nickname: string, curChannel: string, text: string) {
    parseCommand(client: Socket, nickname: string, roomTarget: RoomTarget | null, text: string, setPopUps: Dispatch<SetStateAction<PopUp[]>>) {
        const args: string[] = text.split(" ");
        const command: string | undefined = args.shift();

        if (command !== undefined) {
            if (this.commands.has(command)) {
                this.commands.get(command)!(client, nickname, roomTarget, args, setPopUps);
            }
            else {
                setPopUps((popUps: PopUp[]) => [...popUps, {id: Date.now(), text: ClientErrors.commandNotFound(command)}]);
            }
        }
    }

    join(client: Socket, nickname: string, roomTarget: RoomTarget | null, args: string[], setPopUps: Dispatch<SetStateAction<PopUp[]>>) {
        if (args.length > 0) {
            joinRoom(client, nickname, args[0], args.length > 1 ? args[1] : undefined);
        }
        else {
            setPopUps((popUps: PopUp[]) => [...popUps, {id: Date.now(), text: ClientErrors.wrongArguments('/join')}]);
        }
    }

    leave(client: Socket, nickname: string, roomTarget: RoomTarget | null, args: string[], setPopUps: Dispatch<SetStateAction<PopUp[]>>) {
        if (args.length > 0) {
            client.emit('leave', {...{nickname, room: args[0]}});
        }
        else if (roomTarget && roomTarget.type == RoomType.CHANNEL) {
            client.emit('leave', {...{nickname, room: roomTarget.room.name}});
        }
        else {
            setPopUps((popUps: PopUp[]) => [...popUps, {id: Date.now(), text: ClientErrors.wrongArguments('/leave')}]);
        }
    }

    kick(client: Socket, nickname: string, roomTarget: RoomTarget | null, args: string[], setPopUps: Dispatch<SetStateAction<PopUp[]>>) {
        if (roomTarget && roomTarget.type == RoomType.CHANNEL) {
            if (args.length > 0) {
                kickUser(client, nickname, args[0], roomTarget.room.name, (args.length > 1) ? args.slice(1).toString().replaceAll(",", " ") : "");
            }
            else {
                setPopUps((popUps: PopUp[]) => [...popUps, {id: Date.now(), text: ClientErrors.wrongArguments('/kick')}]);
            }
        }
        else {
            setPopUps((popUps: PopUp[]) => [...popUps, {id: Date.now(), text: ClientErrors.mustBeInChan('/kick')}]);
        }
    }

    banlist(client: Socket, nickname: string, roomTarget: RoomTarget | null, args: string[], setPopUps: Dispatch<SetStateAction<PopUp[]>>) {
        if (roomTarget && roomTarget.type == RoomType.CHANNEL) {
            getBanlist(client, nickname, roomTarget.room.name);
        }
        else {
            setPopUps((popUps: PopUp[]) => [...popUps, {id: Date.now(), text: ClientErrors.mustBeInChan('/banlist')}]);
        }
    }

    mute(client: Socket, nickname: string, roomTarget: RoomTarget | null, args: string[], setPopUps: Dispatch<SetStateAction<PopUp[]>>) {
        if (roomTarget && roomTarget.type == RoomType.CHANNEL) {
            if (args.length > 0) {
                muteUser(client, nickname, args[0], roomTarget.room.name, (args.length > 1) ? args.slice(1).toString().replaceAll(",", " ") : "");
            }
            else {
                setPopUps((popUps: PopUp[]) => [...popUps, {id: Date.now(), text: ClientErrors.wrongArguments('/mute')}]);
            }
        }
        else {
            setPopUps((popUps: PopUp[]) => [...popUps, {id: Date.now(), text: ClientErrors.mustBeInChan('/mute')}]);
        }
    }

    timemute(client: Socket, nickname: string, roomTarget: RoomTarget | null, args: string[], setPopUps: Dispatch<SetStateAction<PopUp[]>>) {
        if (roomTarget && roomTarget.type == RoomType.CHANNEL) {
            if (args.length > 0) {
                timeMuteUser(client, nickname, args[0], roomTarget.room.name, (args.length > 1) ? args.slice(2).toString().replaceAll(",", " ") : "", +args[1] * 1000);
            }
            else {
                setPopUps((popUps: PopUp[]) => [...popUps, {id: Date.now(), text: ClientErrors.wrongArguments('/timemute')}]);
            }
        }
        else {
            setPopUps((popUps: PopUp[]) => [...popUps, {id: Date.now(), text: ClientErrors.mustBeInChan('/mute')}]);
        }
    }

    unmute(client: Socket, nickname: string, roomTarget: RoomTarget | null, args: string[], setPopUps: Dispatch<SetStateAction<PopUp[]>>) {
        if (roomTarget && roomTarget.type == RoomType.CHANNEL) {
            if (args.length > 0) {
                unmuteUser(client, nickname, args[0], roomTarget.room.name);
            }
            else {
                setPopUps((popUps: PopUp[]) => [...popUps, {id: Date.now(), text: ClientErrors.wrongArguments('/unmute')}]);
            }
        }
        else {
            setPopUps((popUps: PopUp[]) => [...popUps, {id: Date.now(), text: ClientErrors.mustBeInChan('/unmute')}]);
        }
    }

    ban(client: Socket, nickname: string, roomTarget: RoomTarget | null, args: string[], setPopUps: Dispatch<SetStateAction<PopUp[]>>) {
        if (roomTarget && roomTarget.type == RoomType.CHANNEL) {
            if (args.length > 0) {
                banUser(client, nickname, args[0], roomTarget.room.name,
                    (args.length > 1) ? args.slice(1).toString().replaceAll(",", " ") : "");
            }
            else {
                setPopUps((popUps: PopUp[]) => [...popUps, {id: Date.now(), text: ClientErrors.wrongArguments('/ban')}]);
            }
        }
        else {
            setPopUps((popUps: PopUp[]) => [...popUps, {id: Date.now(), text: ClientErrors.mustBeInChan('/ban')}]);
        }
    }

    timeban(client: Socket, nickname: string, roomTarget: RoomTarget | null, args: string[], setPopUps: Dispatch<SetStateAction<PopUp[]>>) {
        if (roomTarget && roomTarget.type == RoomType.CHANNEL) {
            if (args.length > 0) {
                timeBanUser(client, nickname, args[0], roomTarget.room.name, (args.length > 1) ? args.slice(2).toString().replaceAll(",", " ") : "", +args[1] * 1000);
            }
            else {
                setPopUps((popUps: PopUp[]) => [...popUps, {id: Date.now(), text: ClientErrors.wrongArguments('/timeban')}]);
            }
        }
        else {
            setPopUps((popUps: PopUp[]) => [...popUps, {id: Date.now(), text: ClientErrors.mustBeInChan('/timeban')}]);
        }
    }

    unban(client: Socket, nickname: string, roomTarget: RoomTarget | null, args: string[], setPopUps: Dispatch<SetStateAction<PopUp[]>>) {
        if (roomTarget && roomTarget.type == RoomType.CHANNEL) {
            if (args.length > 0) {
                unbanUser(client, nickname, args[0], roomTarget.room.name);
            }
            else {
                setPopUps((popUps: PopUp[]) => [...popUps, {id: Date.now(), text: ClientErrors.wrongArguments('/unban')}]);
            }
        }
        else {
            setPopUps((popUps: PopUp[]) => [...popUps, {id: Date.now(), text: ClientErrors.mustBeInChan('/unban')}]);
        }
    }

    set(client: Socket, nickname: string, roomTarget: RoomTarget | null, args: string[], setPopUps: Dispatch<SetStateAction<PopUp[]>>) {
        if (roomTarget && roomTarget.type == RoomType.CHANNEL) {
            if (args.length > 0) {
                const setting: string = args[0].toLowerCase();
                switch (setting) {
                    case 'public':
                        setPrivacy(client, nickname, roomTarget.room.name, setting);
                        break;
                    case 'private':
                        setPrivacy(client, nickname, roomTarget.room.name, setting);
                        break;
                    case 'topic':
                        setTopic(client, nickname, roomTarget.room.name, args.slice(1).join(" "));
                        break;
                    case 'password':
                        setPassword(client, nickname, roomTarget.room.name, args.length > 1 ? args[1] : undefined);
                        break;
                    default:
                        setPopUps((popUps: PopUp[]) => [...popUps, {id: Date.now(), text: ClientErrors.wrongArguments('/set')}]);
                }
            }
            else {
                setPopUps((popUps: PopUp[]) => [...popUps, {id: Date.now(), text: ClientErrors.wrongArguments('/set')}]);
            }
        }
        else {
            setPopUps((popUps: PopUp[]) => [...popUps, {id: Date.now(), text: ClientErrors.mustBeInChan('/set')}]);
        }
    }

    op(client: Socket, nickname: string, roomTarget: RoomTarget | null, args: string[], setPopUps: Dispatch<SetStateAction<PopUp[]>>) {
        if (roomTarget && roomTarget.type == RoomType.CHANNEL) {
            if (args.length > 0) {
                addOperator(client, nickname, args[0], roomTarget.room.name);
            }
            else {
                setPopUps((popUps: PopUp[]) => [...popUps, {id: Date.now(), text: ClientErrors.wrongArguments('/op')}]);
            }
        }
        else {
            setPopUps((popUps: PopUp[]) => [...popUps, {id: Date.now(), text: ClientErrors.mustBeInChan('/op')}]);
        }
    }

    deop(client: Socket, nickname: string, roomTarget: RoomTarget | null, args: string[], setPopUps: Dispatch<SetStateAction<PopUp[]>>) {
        if (roomTarget && roomTarget.type == RoomType.CHANNEL) {
            if (args.length > 0) {
                removeOperator(client, nickname, args[0], roomTarget.room.name);
            }
            else {
                setPopUps((popUps: PopUp[]) => [...popUps, {id: Date.now(), text: ClientErrors.wrongArguments('/deop')}]);
            }
        }
        else {
            setPopUps((popUps: PopUp[]) => [...popUps, {id: Date.now(), text: ClientErrors.mustBeInChan('/deop')}]);
        }
    }

    invitelist(client: Socket, nickname: string, roomTarget: RoomTarget | null, args: string[], setPopUps: Dispatch<SetStateAction<PopUp[]>>) {
        if (roomTarget && roomTarget.type == RoomType.CHANNEL) {
            getInviteList(client, nickname, roomTarget.room.name);
        }
        else {
            setPopUps((popUps: PopUp[]) => [...popUps, {id: Date.now(), text: ClientErrors.mustBeInChan('/invitelist')}]);
        }
    }

    invite(client: Socket, nickname: string, roomTarget: RoomTarget | null, args: string[], setPopUps: Dispatch<SetStateAction<PopUp[]>>) {
        if (roomTarget && roomTarget.type == RoomType.CHANNEL) {
            if (args.length > 0) {
                inviteToChan(client, nickname, args[0], roomTarget.room.name);
            }
            else {
                setPopUps((popUps: PopUp[]) => [...popUps, {id: Date.now(), text: ClientErrors.wrongArguments('/invite')}]);
            }
        }
        else {
            setPopUps((popUps: PopUp[]) => [...popUps, {id: Date.now(), text: ClientErrors.mustBeInChan('/invite')}]);
        }
    }
}