import { UserBox } from "./UserBox";
import styles from '../../../styles/chat/UsersArea.module.scss'
import { Dispatch, SetStateAction, useContext } from "react";
import { UserMenuInfo } from "./UsersArea";
import { Message, RoomTarget, RoomType } from "../lib/chatTypes";
import { GlobalDataContext } from "../../Utils/Layout";

type Props = {
    usersDisplayed: string[],
    isPm: boolean,
    setMenuInfo: Dispatch<SetStateAction<UserMenuInfo | null>>,
    curRoom: RoomTarget | null,
    setCurRoom: Dispatch<SetStateAction<RoomTarget | null>>,
    setMessages: Dispatch<SetStateAction<Message[]>>,
}

export const UserList = ({ usersDisplayed, isPm, setMenuInfo, curRoom, setCurRoom, setMessages }: Props) => {
    const globalData = useContext(GlobalDataContext)!;

    return (
        <>
            {usersDisplayed.map((user: string) => {
                if (user !== globalData.nickname) {
                    return (
                        <UserBox key={user} userName={user} {...{ setMenuInfo, curRoom, setCurRoom, setMessages, isPm }} />
                    );
                }
            })}
            {usersDisplayed.length === 0 && isPm &&
                <h3>No direct messages</h3>}
            {usersDisplayed.length === 1 && usersDisplayed[0] === globalData.nickname && curRoom && curRoom.type === RoomType.CHANNEL &&
                <h3>You are alone in this channel</h3>}
        </>
    )
}