import { useContext, useEffect, useRef, useState } from "react";
import styles from '../../../styles/chat/Social.module.scss'
import { ChannelArea } from "./ChannelArea";
import { ChatArea } from "./ChatArea";
import { subAddedFriend, subJoinedChannel, subJoinedPrivateConv, subLeftChannel, subLeftPrivateConv, subReceive, subReceiveInfo, subRemovedFriend, subUpdatedChannelTopic, subUpdateFriends } from "../lib/chatSubscribers";
import { Friend, FriendStatus, Message, PopUp, Room, RoomTarget } from "../lib/chatTypes";
import { PopUpContainer } from "./PopUpContainer";
import { GlobalDataContext } from "../../Utils/Layout";
import { UsersArea } from "./UsersArea";
import { ScrollStatus } from "./MessagesArea";

const ChatENDPOINT = "http://127.0.0.1:8100";

export const ChatEntrypoint = () => {
    const globalData = useContext(GlobalDataContext)!;

    const [popUps, setPopUps] = useState<PopUp[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [channels, setChannels] = useState<Room[]>([]);
    const [pms, setPms] = useState<string[]>([]);

    const [curRoom, setCurRoom] = useState<RoomTarget | null>(null);
    const curRoomRef = useRef(curRoom);

    const scrollRef = useRef<ScrollStatus | null>(null);

    const [friends, setFriends] = useState<Friend[]>([]);
    const [displayInfos, setDisplayInfos] = useState<boolean>(false);

    const [displayDm, setDisplayDm] = useState<boolean>(true);

    useEffect(() => {
        curRoomRef.current = curRoom;
    }, [curRoom])

    useEffect(() => {
            /// Content update from server
            globalData.socket.emit('initChannels', globalData.nickname, (newChannels: Room[]) => {
                setChannels(newChannels);
            })
            globalData.socket.emit('initPms', globalData.nickname, (newPms: string[]) => {
                setPms(newPms);
            });
            globalData.socket.emit('initFriends', globalData.nickname, (newFriends: {nickname: string, status: FriendStatus}[]) => {
                setFriends(newFriends);
            });

            /// Event subscribers
            subJoinedChannel(globalData.socket, setChannels, setMessages, setCurRoom, setDisplayDm);
            subJoinedPrivateConv(globalData.socket, setPms);
            subLeftPrivateConv(globalData.socket, setCurRoom, setPms);
            subLeftChannel(globalData.socket, setChannels, setMessages, setCurRoom);
            subUpdatedChannelTopic(globalData.socket, setChannels, setCurRoom);
            subReceive(globalData.socket, setMessages, curRoomRef, scrollRef);
            subReceiveInfo(globalData.socket, setPopUps);
            subAddedFriend(globalData.socket, setFriends);
            subRemovedFriend(globalData.socket, setFriends);
            subUpdateFriends(globalData.socket, setFriends);
            return (() => {
                globalData.socket.off("joinedRoom");
                globalData.socket.off("leftRoom");
                globalData.socket.off("updatedTopic");
                globalData.socket.off("joinedPm");
                globalData.socket.off("leftPm");
                globalData.socket.off("receive");
                globalData.socket.off("receiveInfo");
                globalData.socket.off("addedFriend");
                globalData.socket.off("removedFriend");
                globalData.socket.off("updateFriends");
                globalData.socket.off("updateChannelUsers");
            })
    }, [globalData]);

    return (
        <>
            <div className={styles.generalContainer}>
                <div className={styles.socialContainer}>
                    <ChannelArea {...{curRoom, displayDm, setCurRoom, setMessages, setDisplayDm, channels}}/>
                    <UsersArea {...{curRoom, setCurRoom, setMessages, displayInfos, setDisplayInfos, displayDm, friends, pms, popUps}}/>
                    <ChatArea {...{curRoom, messages, displayInfos, scrollRef, setPopUps}}/>
                </div>
            </div>
            {popUps.length != 0 && <PopUpContainer {...{popUps, setPopUps}}/>}
        </>
    );
}