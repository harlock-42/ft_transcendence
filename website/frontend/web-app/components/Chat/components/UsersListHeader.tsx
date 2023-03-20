import { ChangeEvent, Dispatch, SetStateAction, useContext, useEffect } from "react";
import { GlobalDataContext } from "../../Utils/Layout";
import styles from '../../../styles/chat/UsersArea.module.scss'
import { PopUp, RoomTarget } from "../lib/chatTypes";
import Image from "next/image";
import Friends from "../../../public/utils/noun-friends-5143349.svg";
import Search from "../../../public/utils/noun-search-5233315.svg";

type Props = {
    curRoom: RoomTarget | null,
    setUsersDisplayed: Dispatch<SetStateAction<string[]>>,
    setDisplayFriends: Dispatch<SetStateAction<boolean>>,
    displayDm: boolean,
    popUps: PopUp[]
}

export const UsersListHeader = ({ curRoom, setUsersDisplayed, setDisplayFriends, displayDm, popUps }: Props) => {
    const globalData = useContext(GlobalDataContext)!;

    useEffect(() => {
        if (!displayDm && curRoom) {
            globalData.socket.emit('getUsersInChannel', { channelName: curRoom.room.name }, (newUsers: string[]) => {
                setUsersDisplayed(newUsers);
            })
        }
        else {
            setUsersDisplayed([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [displayDm, curRoom, popUps])

    function updateUsersDisplayed(event: ChangeEvent<HTMLInputElement>) {
        setDisplayFriends(false);
        if (displayDm) {
            if (event.target.value === "") {
                setUsersDisplayed([]);
            }
            else {
                globalData.socket.emit('getUsers', event.target.value, (newUsers: string[]) => {
                    setUsersDisplayed(newUsers);
                })
            }
        }
        else if (curRoom) {
            globalData.socket.emit('getUsersInChannel', { channelName: curRoom.room.name, filter: event.target.value }, (newUsers: string[]) => {
                setUsersDisplayed(newUsers);
            })
        }
    }

    return (
        <div className={styles.searchUserHeader}>
            <div>
                <Image
                    src={Search}
                    alt="Account"
                    layout="responsive"
                    objectFit="contain"
                />
            </div>
            <input
                type='text'
                placeholder="Search"
                onChange={updateUsersDisplayed}
            >
            </input>
        </div>
    );
}