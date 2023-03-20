import { RoomTarget } from "../lib/chat.types";

export class MessageDTO {
    text: string;
    date: number;
    senderNickname?: string;
    target?: RoomTarget;
}

export class ChannelDTO {
    nickname: string;
    channelName: string;
    isPublic: boolean;
    password?: string;
    topic?: string;
    image?: {
        file: Buffer;
        type: string;
    };
}

export class RoomDTO {
    nickname: string;
    room: string;
    password?: string;
}

export class TargetDTO {
    nickname: string;
    target: string;
}

export class TargetInRoomDTO {
    nickname: string;
    target: string;
    room: string;
}

export class RoomSettingsDTO {
    nickname: string;
    room: string;
    setting: string;
}

export class RoomRestrictionDTO {
    nickname: string;
    target: string;
    room: string;
    reason: string;
    time?: number;
}