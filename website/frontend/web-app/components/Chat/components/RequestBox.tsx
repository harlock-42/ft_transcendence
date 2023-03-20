import { Friend, Message, RoomTarget } from "../lib/chatTypes"
import { UserBox } from "./UserBox"
import styles from '../../../styles/chat/UsersArea.module.scss'
import { Dispatch, SetStateAction, useContext } from "react";
import { UserMenuInfo } from "./UsersArea";
import acceptImg from "../../../public/utils/noun-accept.svg"
import declineImg from "../../../public/utils/noun-denied.svg"
import Image from "next/image";
import { acceptFriend, removeFriend } from "../lib/chatQuery";
import { GlobalDataContext } from "../../Utils/Layout";

type Props = {
    friend: Friend,
    setMenuInfo: Dispatch<SetStateAction<UserMenuInfo | null>>,
    curRoom: RoomTarget | null,
    setCurRoom: Dispatch<SetStateAction<RoomTarget | null>>,
    setMessages: Dispatch<SetStateAction<Message[]>>
}

export const RequestBox = ({ friend, setMenuInfo, curRoom, setCurRoom, setMessages }: Props) => {
    const globalData = useContext(GlobalDataContext)!;

    return (
        <div className={styles.friendRequestBoxContainer}>
            <UserBox {...{ setMenuInfo, curRoom, setCurRoom, setMessages }} userName={friend.nickname} key={friend.nickname} isPm={false} />
            <div className={styles.friendRequestButtonsContainer}>
                <div
                    onClick={() => {
                        acceptFriend(globalData.socket, globalData.nickname, friend.nickname);
                    }}
                >
                    <Image
                        src={acceptImg}
                        alt="Account"
                        layout="responsive"
                        objectFit="contain"
                    />
                </div>
                <div
                    onClick={() => {
                        removeFriend(globalData.socket, globalData.nickname, friend.nickname);
                    }}
                >
                    <Image
                        src={declineImg}
                        alt="Account"
                        layout="responsive"
                        objectFit="contain"
                    />
                </div>
            </div>
        </div>
    )
}