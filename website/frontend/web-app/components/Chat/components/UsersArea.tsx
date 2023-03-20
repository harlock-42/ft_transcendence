import { Dispatch, SetStateAction, useContext, useEffect, useState } from 'react';
import styles from '../../../styles/chat/UsersArea.module.scss'
import { Friend, Message, PopUp, RoomTarget } from '../lib/chatTypes';
import { FriendList } from './FriendList';
import { UsersListHeader } from './UsersListHeader';
import { UserList } from './UserList';
import { UserMenu } from './UserMenu';
import Image from "next/image";
import Friends from "../../../public/utils/noun-friends-5143349.svg";
import Info from "../../../public/utils/noun-info-1585217.svg";
import { GlobalDataContext } from '../../Utils/Layout';
import { subUpdateChannelUserList } from '../lib/chatSubscribers';
import { Socket } from 'dgram';

type Props = {
    curRoom: RoomTarget | null,
    setCurRoom: Dispatch<SetStateAction<RoomTarget | null>>,
    setMessages: Dispatch<SetStateAction<Message[]>>,
    displayInfos: boolean,
    setDisplayInfos: Dispatch<SetStateAction<boolean>>,
    displayDm: boolean,
    friends: Friend[],
    pms: string[],
    popUps: PopUp[]
}

export interface UserMenuInfo {
    nickname: string,
    pos: {
        x: number,
        y: number
    },
    elemClicked: EventTarget
}

export const UsersArea = ({ curRoom, setCurRoom, setMessages, displayInfos, setDisplayInfos, displayDm, friends, pms, popUps }: Props) => {
    const globalData = useContext(GlobalDataContext)!;
    const [menuInfo, setMenuInfo] = useState<UserMenuInfo | null>(null);
    const [displayFriends, setDisplayFriends] = useState<boolean>(false);
    const [usersDisplayed, setUsersDisplayed] = useState<string[]>([]);



    useEffect(() => {
        function removeMenuInfo(e: MouseEvent) {
            if (menuInfo == null || e.target == menuInfo?.elemClicked)
                return;
            setMenuInfo(null);
        }

        subUpdateChannelUserList(globalData.socket, curRoom, setUsersDisplayed);
        window.addEventListener('click', removeMenuInfo);
        return (() => {
            window.removeEventListener('click', removeMenuInfo);
            globalData.socket.off('updateChannelUsers')
        })
    }, [globalData, curRoom, menuInfo])

    return (
        <div className={styles.middleContainer}>

            {/*Header*/}
            <UsersListHeader {...{ curRoom, setUsersDisplayed, setDisplayFriends, displayDm, popUps }} />

            {/*USERS*/}
            <div className={styles.usersListContainer}>

                {/*Friend List*/}
                {displayDm && displayFriends && <FriendList {...{ friends, setMenuInfo, curRoom, setCurRoom, setMessages }} isPm={false} />}

                {/*// Direct Messages List*/}
                {!displayFriends && displayDm && usersDisplayed.length === 0 && <UserList {...{ setMenuInfo, curRoom, setCurRoom, setMessages }} usersDisplayed={pms} isPm={true} />}

                {/*// Channel and Search USERS*/}
                <UserList {...{ usersDisplayed, setMenuInfo, curRoom, setCurRoom, setMessages }} isPm={false} />

            </div>
            <div className={styles.usersFooterContainer}>
                {displayDm && <button
                    className={displayFriends ? styles.buttonActive : ""}
                    onClick={() => setDisplayFriends((displayFriends: boolean) => !displayFriends)}
                >
                    <Image
                        src={Friends}
                        alt="Account"
                        layout="responsive"
                        objectFit="contain"
                    />
                </button>}
                <button
                    className={displayInfos ? styles.buttonActive : ""}
                    onClick={() => setDisplayInfos((displayInfos: boolean) => !displayInfos)}
                >
                    <Image
                        src={Info}
                        alt="Account"
                        layout="responsive"
                        objectFit="contain"
                    />
                </button>
            </div>

            {menuInfo && <UserMenu {...{ menuInfo, pms, curRoom, setCurRoom, setMessages }} />}
        </div>
    );
}