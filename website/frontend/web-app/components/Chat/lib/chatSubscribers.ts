import { time } from "console";
import { captureRejectionSymbol } from "events";
import { Dispatch, MutableRefObject, SetStateAction } from "react";
import { Socket } from "socket.io-client";
import { ScrollStatus } from "../components/MessagesArea";
import { RoomTarget, RoomType, Message, Friend, Room, PopUp } from "./chatTypes";

export function subJoinedChannel (
    socket: Socket,
    setChannels: Dispatch<SetStateAction<Room[]>>,
    setMessages: Dispatch<SetStateAction<Message[]>>,
    setCurRoom: Dispatch<SetStateAction<RoomTarget | null>>,
    setDisplayDm: Dispatch<SetStateAction<boolean>>) {
        socket.on('joinedRoom', (newChannel: Room) => {
            setChannels((channels: Room[]) => channels.includes(newChannel) ? [...channels] : [...channels, newChannel]);
            socket.emit('getAllInChannel', newChannel.name, (newMessages: Message[]) => {
                setMessages(newMessages);
            })
            setCurRoom({
                type: RoomType.CHANNEL,
                room: {
                    name: newChannel.name,
                    topic: newChannel.topic
                }
            })
            setDisplayDm(false);
        });
}

export function subLeftChannel (
    socket: Socket,
    setChannels: Dispatch<SetStateAction<Room[]>>,
    setMessages: Dispatch<SetStateAction<Message[]>>,
    setCurRoom: Dispatch<SetStateAction<RoomTarget | null>>) {
        socket.on('leftRoom', (channelName: string) => {
            setChannels((channels: Room[]) => {
                return (channels.filter((channel: Room) => channel.name !== channelName));
            })
            setCurRoom((curRoom: RoomTarget | null) => {
                if (curRoom && curRoom.type === RoomType.CHANNEL && curRoom.room.name === channelName) {
                    return (null);
                }
                return (curRoom);
            })
        })
}

export function subUpdatedChannelTopic (
    socket: Socket,
    setChannels: Dispatch<SetStateAction<Room[]>>,
    setCurRoom: Dispatch<SetStateAction<RoomTarget | null>>) {
        socket.on('updatedTopic', (room: Room) => {
            setChannels((channels: Room[]) => {
                channels.forEach((channel: Room) => {
                    if (channel.name === room.name) {
                        channel.topic = room.topic;
                    }
                })
                return (channels);
            });
            setCurRoom((curRoom: RoomTarget | null) => {
                if (curRoom && curRoom.type === RoomType.CHANNEL && curRoom.room.name === room.name) {
                    return ({
                        type: RoomType.CHANNEL,
                        room: room
                    });
                }
                return (curRoom);
            })
        })
}
                           
export function subJoinedPrivateConv (
    socket: Socket,
    setPms: Dispatch<SetStateAction<string[]>>) {
        socket.on('joinedPm', (targetName: string) => {
            setPms((pms: string[]) => pms.includes(targetName) ? [...pms] : [...pms, targetName]);
        });
}

export function subLeftPrivateConv (
    socket: Socket,
    setCurRoom: Dispatch<SetStateAction<RoomTarget | null>>,
    setPms: Dispatch<SetStateAction<string[]>>){
        socket.on('leftPm', (targetName: string) => {
            setPms((pms: string[]) => pms.filter((pm: string) => targetName !== pm));
            setCurRoom(null);
        })
}


export function subReceive (
    socket: Socket,
    setMessages: Dispatch<SetStateAction<Message[]>>,
    curChatRef: MutableRefObject<RoomTarget | null>,
    scrollRef: MutableRefObject<ScrollStatus | null>)
    {
        socket.on('receive', (newMessage: Message) => {
            if (newMessage.target && curChatRef.current
                && newMessage.target.type === curChatRef.current.type
                && (newMessage.target.room.name === curChatRef.current.room.name
                    || newMessage.target.type === RoomType.PM && newMessage.senderNickname === curChatRef.current.room.name)) {
                const tmp = scrollRef.current;
                if (tmp && tmp.element.scrollTop + tmp.element.clientHeight >= tmp.element.scrollHeight - 1) {
                    tmp.status = true;
                }
                setMessages((messages) => [...messages, newMessage]);
            }
        })
}
             
export function subReceiveInfo (
    socket: Socket, 
    setPopUps: Dispatch<SetStateAction<PopUp[]>>) {
        socket.on('receiveInfo', (info: string) => {
            setPopUps((popUps: PopUp[]) => [...popUps, {id: Date.now(), text: info}]);
        })
}

export function subAddedFriend (
    socket: Socket,
    setFriends: Dispatch<SetStateAction<Friend[]>>) {
        socket.on('addedFriend', (newFriend: Friend) => {
            setFriends((friends) => [...friends, newFriend]);
        })
}

export function subRemovedFriend (
    socket: Socket,
    setFriends: Dispatch<SetStateAction<Friend[]>>) {
        socket.on('removedFriend', (oldFriend: string) => {
            setFriends((friends) => {
                return (friends.filter(({nickname}) => nickname !== oldFriend));
            })
        })
}

export function subUpdateFriends (
    socket: Socket,
    setFriends: Dispatch<SetStateAction<Friend[]>>) {
        socket.on('updateFriends', (newFriends: Friend[]) => {
            setFriends(newFriends);
        })
}

export function subUpdateChannelUserList (
    socket: Socket,
    curRoom: RoomTarget | null,
    setUserDisplayed: Dispatch<SetStateAction<string[]>>) {
        socket.on('updateChannelUsers', ({channelName, newUser}: {channelName: string, newUser: string}) => {
            if (curRoom && curRoom.room.name === channelName) {
                setUserDisplayed((userDisplayed) => [...userDisplayed, newUser]);
            }
        })
}