import {closePrivateConv, leaveRoom, removeFriend} from '../lib/chatQuery';
import styles from '../../../styles/chat/Messages.module.scss'
import {MessageBox} from './MessageBox';
import {MutableRefObject, useContext, useEffect, useRef, useState} from 'react';
import {Message, RoomTarget, RoomType} from '../lib/chatTypes';
import {GlobalDataContext} from '../../Utils/Layout';
import Image from "next/image";
import declineImg from "../../../public/utils/noun-leave-64033.svg";

type Props = {
    curRoom: RoomTarget | null,
    messages: Message[],
    scrollRef: MutableRefObject<ScrollStatus | null>
}

export interface ScrollStatus {
    element: HTMLDivElement;
    status: boolean;
}

export const  MessagesArea = ({curRoom, messages, scrollRef}: Props) => {
	const globalData = useContext(GlobalDataContext)!;
    const msgContainerRef = useRef<HTMLDivElement | null>(null);
    const firstTimeRef = useRef<boolean>(true);

    useEffect(() => {
        const tmp: HTMLDivElement | null = msgContainerRef.current;

        if (!scrollRef.current && tmp) {
            scrollRef.current = {
                element: tmp,
                status: false
            }
        }
        if (curRoom && tmp && (firstTimeRef.current || scrollRef.current?.status)) {
            tmp.scrollTop = tmp.scrollHeight;
            firstTimeRef.current = false;
            scrollRef.current && (scrollRef.current.status = false);
        }
    }, [messages, curRoom, scrollRef])

    useEffect(() => {
        firstTimeRef.current = true;
    }, [curRoom])

	return (
		<div
            style={{'visibility': curRoom != null ? "visible" : "visible"} as React.CSSProperties}
			className={styles.chatTextContainer}
        >
			{curRoom != null && (
				<>
					<div className={styles.chatAreaHeader}>
						<div className={styles.chatAreaHeaderInfo}>
							<h1>{curRoom.room.name}</h1>
							<a style={{'visibility': curRoom.room.topic ? "visible" : "collapse"} as React.CSSProperties}>{"Topic: " + curRoom.room.topic}</a>
						</div>
						<div className={styles.chatAreaHeaderIcons}>
							<button
								onClick={() => {
									curRoom?.type === RoomType.CHANNEL ?
									leaveRoom(globalData.socket, globalData.nickname, curRoom.room.name) :
										closePrivateConv(globalData.socket, globalData.nickname, curRoom.room.name)
									// removeFriend(globalData.socket, globalData.nickname, curRoom?.room.name);
								}}
							>
								<Image
								src={declineImg}
								alt="Account"
								layout="responsive"
								objectFit="contain"
								/>
							</button>
						</div>
					</div>
					<div className={styles.messageContainer}>
						<div ref={msgContainerRef} className={styles.messagesContainer}>
							{messages.map((message: Message, index: number) => {
								return (<MessageBox {...{message}} key={index}/>);
							})}
						</div>
					</div>
				</>
			)}
		</div>
	);
}