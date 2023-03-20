import styles from '../../../styles/chat/UsersArea.module.scss'
import { Dispatch, SetStateAction, useContext } from "react";
import { GlobalDataContext } from "../../Utils/Layout";
import { Message, RoomTarget, RoomType } from "../lib/chatTypes";
import { UserMenuInfo } from "./UsersArea";

type Props = {
    userName: string,
    setMenuInfo: Dispatch<SetStateAction<UserMenuInfo | null>>,
    curRoom: RoomTarget | null,
    setCurRoom: Dispatch<SetStateAction<RoomTarget | null>>,
    setMessages: Dispatch<SetStateAction<Message[]>>,
    isPm: boolean
}

export const UserBox = ({ userName, setMenuInfo, curRoom, setCurRoom, setMessages, isPm }: Props) => {
    const globalData = useContext(GlobalDataContext)!;

    return (
        <div
            className={styles.userBox}
            onClick={(event) => {
                if (isPm) {
                    if (curRoom && curRoom.type === RoomType.PM && curRoom.room.name === userName) {
                        return;
                    }
                    setCurRoom({
                        type: RoomType.PM,
                        room: {
                            name: userName
                        }
                    })
                    globalData.socket.emit('getAllInPms', {
                        nickname: globalData.nickname,
                        target: userName
                    }, (response: Message[]) => {
                        setMessages(response);
                    })
                }
                else {
                    const targetRect = event.currentTarget.getBoundingClientRect();
                    setMenuInfo({
                        nickname: userName,
                        pos: {
                            x: targetRect.left + targetRect.width,
                            y: targetRect.top + targetRect.height / 2
                        },
                        elemClicked: event.target
                    })
                }
            }}
        >
            {userName}
        </div>
    );
}