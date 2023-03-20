import { Dispatch, SetStateAction } from 'react';
import styles from '../../../styles/chat/UsersArea.module.scss'
import { Friend, FriendStatus, Message, RoomTarget } from '../lib/chatTypes';
import { RequestBox } from './RequestBox';
import { UserBox } from './UserBox';
import { UserMenuInfo } from './UsersArea';

type Props = {
    friends: Friend[],
    setMenuInfo: Dispatch<SetStateAction<UserMenuInfo | null>>,
    curRoom: RoomTarget | null,
    setCurRoom: Dispatch<SetStateAction<RoomTarget | null>>,
    setMessages: Dispatch<SetStateAction<Message[]>>,
    isPm: boolean
}

export const FriendList = ({friends, setMenuInfo, curRoom, setCurRoom, setMessages, isPm}: Props) => {
    function checkFriendRequests(): boolean {
        for (let i: number = 0 ; i < friends.length ; ++i) {
            if (friends[i].status === FriendStatus.INCOMING) {
                return (true);
            }
        }
        return (false);
    }

    return (
        <>
            {checkFriendRequests() && <div className={styles.friendRequestsContainer}>
                {friends.map((friend: Friend) => {
                    if (friend.status === FriendStatus.INCOMING) {
                        return (
                            <RequestBox {...{friend, setMenuInfo, curRoom, setCurRoom, setMessages}} key={friend.nickname} />
                        )
                    }
                })}
            </div>}
            <div className={styles.friendListContainer}>
                {friends.length > 0 && friends.map((friend: Friend) => {
                    if (friend.status === FriendStatus.ACCEPTED) {
                        return (
                            <UserBox {...{setMenuInfo, curRoom, setCurRoom, setMessages, isPm}} userName={friend.nickname} key={friend.nickname} />
                        );
                    }
                })}
                {(friends.length === 0 || checkFriendRequests()) && <h3>No Friends</h3>}
            </div>
        </>
    );
}