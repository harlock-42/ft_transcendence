import Image from 'next/image';
import { Dispatch, SetStateAction, useContext, useEffect, useState } from 'react';
import styles from '../../../styles/chat/Channels.module.scss'
import { GlobalDataContext } from '../../Utils/Layout';
import { Message, Room, RoomTarget, RoomType } from '../lib/chatTypes';

type Props = {
    curRoom: RoomTarget | null,
    setCurRoom: Dispatch<SetStateAction<RoomTarget | null>>,
    setMessages: Dispatch<SetStateAction<Message[]>>,
    setDisplayDm: Dispatch<SetStateAction<boolean>>,
    channel: Room,
}

// const myLoader = ({src}: {src: string}) => {
//     return `${src}`
// }

export const ChannelBox = ({curRoom, setCurRoom, setMessages, setDisplayDm, channel}: Props) => {
    const globalData = useContext(GlobalDataContext)!;
    const [showName, setShowName] = useState<boolean>(false);

    function updateCurrentChannel() {
        if (curRoom && curRoom.type === RoomType.CHANNEL && curRoom?.room.name === channel.name){
            return ;
        }
        setDisplayDm(false);
        setCurRoom((curRoom: RoomTarget | null) => {
            return {
                type: RoomType.CHANNEL,
                room: {
                    name: channel.name,
                    topic: channel.topic
                }
            }
        });
        globalData.socket.emit('getAllInChannel', channel.name, (newMessages: Message[]) => {
            setMessages(newMessages);
        })
    }

    return (
        <div
            className={styles.channelButtonContainer + (curRoom && channel.name === curRoom.room.name ? " " + styles.channelButtonContainerActive : "")}
            onClick={updateCurrentChannel}
            onMouseEnter={() => setShowName(true)}
            onMouseLeave={() => setShowName(false)}
        >
            {channel.imagePath && <Image src={'http://' + process.env.NEXT_PUBLIC_BACKEND_ENDPOINT + '/social/img' + channel.imagePath} alt={channel.name} width="10px" height="10px" layout="responsive" objectFit="cover"/>
                || <div className={styles.noImage}><a>{channel.name[0]}</a></div>}

            {showName && <div className={styles.showName}>
                {channel.name}
            </div>}
        </div>
    );
}