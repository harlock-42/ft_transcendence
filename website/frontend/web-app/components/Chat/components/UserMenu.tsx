import { useRouter } from 'next/router';
import { Dispatch, MouseEventHandler, SetStateAction, useContext, useEffect, useState } from 'react';
import styles from '../../../styles/chat/Friends.module.scss'
import { FriendGameInfo } from '../../Game/lib/GameMaster';
import { GlobalDataContext } from '../../Utils/Layout'
import { addFriend, blockUser, createPrivateConv, inviteToPong, removeFriend, unblockUser } from '../lib/chatQuery';
import { Friend, Message, RoomTarget, RoomType } from '../lib/chatTypes';
import { UserMenuInfo } from './UsersArea';

interface RelationInfo {
    isFriend: boolean;
    isBlocked: boolean;
}

type MenuProps = {
    menuInfo: UserMenuInfo,
    pms: string[],
    curRoom: RoomTarget | null,
    setCurRoom: Dispatch<SetStateAction<RoomTarget | null>>,
    setMessages: Dispatch<SetStateAction<Message[]>>
}

type ItemProps = {
    eventFunction: MouseEventHandler<HTMLDivElement>,
    text: string
}

const UserMenuItem = ({ eventFunction, text }: ItemProps) => {
    return (
        <div
            className={styles.contextMenuItem}
            onClick={eventFunction}
        >{text}</div>
    )
}

export const UserMenu = ({ menuInfo, pms, curRoom, setCurRoom, setMessages }: MenuProps) => {
    const globalData = useContext(GlobalDataContext)!;
    const [relationInfos, setRelationInfos] = useState<RelationInfo | null>(null);
    const router = useRouter();

    useEffect(() => {
        globalData.socket.emit('getRelationInfos', {
            nickname: globalData.nickname,
            target: menuInfo.nickname
        }, (response: RelationInfo) => {
            setRelationInfos(response);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [menuInfo])

    function profileClick() {
        if (router.isReady) {
            router.push('/profile/' + menuInfo.nickname);
        }
    }

    function sendPmClick() {
        if (!pms.includes(menuInfo.nickname)) {
            createPrivateConv(globalData.socket, globalData.nickname, menuInfo.nickname, () => {
                globalData.socket.emit('getAllInPms', {
                    nickname: globalData.nickname,
                    target: menuInfo.nickname
                }, (response: Message[]) => {
                    setMessages(response);
                })
            });
            setCurRoom({
                type: RoomType.PM,
                room: {
                    name: menuInfo.nickname
                }
            })
        }
    }

    function addFriendClick() {
        addFriend(globalData.socket, globalData.nickname, menuInfo.nickname);
    }

    function removeFriendClick() {
        removeFriend(globalData.socket, globalData.nickname, menuInfo.nickname);
    }

    function blockClick() {
        blockUser(globalData.socket, globalData.nickname, menuInfo.nickname);
    }

    function unblockClick() {
        unblockUser(globalData.socket, globalData.nickname, menuInfo.nickname);
    }

    function inviteToPongClick() {
        inviteToPong(globalData.socket, globalData.nickname, menuInfo.nickname, (response: FriendGameInfo) => {
            if (response) {
                localStorage.setItem('gameRequest', JSON.stringify(response));
                router.push('/');
            }
        });
    }

    return (
        <>
            {relationInfos &&
                <div
                    className={styles.friendContextMenu}
                    style={{ top: menuInfo.pos.y, left: menuInfo.pos.x }}
                >
                    <UserMenuItem eventFunction={profileClick} text="PROFILE" />
                    <UserMenuItem eventFunction={inviteToPongClick} text="INVITE TO PONG" />
                    {(!curRoom || curRoom.type === RoomType.PM) && <UserMenuItem eventFunction={sendPmClick} text="SEND MESSAGE" />}
                    {relationInfos.isFriend && <UserMenuItem eventFunction={removeFriendClick} text="REMOVE FRIEND" />
                        || <UserMenuItem eventFunction={addFriendClick} text="ADD FRIEND" />}
                    {relationInfos.isBlocked && <UserMenuItem eventFunction={unblockClick} text="UNBLOCK" />
                        || <UserMenuItem eventFunction={blockClick} text="BLOCK" />}
                </div>}
        </>
    )
}