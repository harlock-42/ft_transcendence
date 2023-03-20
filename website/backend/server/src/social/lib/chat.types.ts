export enum RoomType {
    CHANNEL = 0,
    PM,
}

export interface Room {
    name: string;
    topic?: string;
    // image?: Buffer;
    imagePath?: string;
    hasPassword?: boolean;
}

export interface RoomTarget {
    type: RoomType;
    room: Room;
}