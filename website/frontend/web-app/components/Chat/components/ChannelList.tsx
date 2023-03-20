import { Dispatch, SetStateAction } from 'react';
import styles from '../../../styles/chat/Channels.module.scss'
import { Message, Room, RoomTarget } from '../lib/chatTypes';
import { ChannelBox } from './ChannelBox';

type Props = {
    curRoom: RoomTarget | null,
    setCurRoom: Dispatch<SetStateAction<RoomTarget | null>>,
    setMessages: Dispatch<SetStateAction<Message[]>>,
    channels: Room[],
    setDisplayDm: Dispatch<SetStateAction<boolean>>
}

export const ChannelList = ({curRoom, setCurRoom, setMessages, channels, setDisplayDm}: Props) => {
    return (
        <div className={styles.channelList}>
            {channels.map((channel: Room) => {
                return (
                    <ChannelBox {...{curRoom, setCurRoom, setMessages, setDisplayDm, channel}} key={channel.name}/>
                )
            })}
        </div>
    );
}