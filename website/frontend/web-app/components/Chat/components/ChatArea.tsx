import { Dispatch, MutableRefObject, SetStateAction } from 'react';
import styles from '../../../styles/chat/Messages.module.scss'
import { Message, PopUp, RoomTarget } from '../lib/chatTypes';
import { Informations } from './Informations';
import { InputArea } from './InputArea';
import { MessagesArea, ScrollStatus } from './MessagesArea';

type Props = {
    curRoom: RoomTarget | null,
    messages: Message[],
    displayInfos: boolean,
    scrollRef: MutableRefObject<ScrollStatus | null>,
    setPopUps: Dispatch<SetStateAction<PopUp[]>>
}

export const ChatArea = ({curRoom, messages, displayInfos, scrollRef, setPopUps}: Props) => {
    return (
        <div className={styles.chatAreaContainer}>
            {!displayInfos && <>
                <MessagesArea {...{curRoom, messages, scrollRef}}/>
                <InputArea {...{curRoom, setPopUps}}/>
            </>}
            {displayInfos && <Informations />}
        </div>
    );
}