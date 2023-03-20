export interface Friend {
    nickname: string;
    status: FriendStatus;
}

export enum FriendStatus {
    ACCEPTED = 0,
    PENDING,
    INCOMING
}

export interface Room {
    name: string;
    topic?: string;
    imagePath?: string;
    hasPassword?: boolean;
}

export enum RoomType {
    CHANNEL = 0,
    PM = 1
}

export interface RoomTarget {
    type: RoomType;
    // name: string;
    room: Room;
}

export interface Message {
    text: string;
    date: number;
    senderNickname?: string;
    target?: RoomTarget;
}

export interface PopUp {
    id: number;
    text: string;
}