import styles from '../../../styles/chat/Channels.module.scss'
import stylesPreview from '../../../styles/chat/Messages.module.scss'

import Image from 'next/image';
import {Dispatch, FormEvent, FormEventHandler, SetStateAction, useContext, useRef} from 'react';
import {joinRoom} from '../lib/chatQuery';
import {GlobalDataContext} from '../../Utils/Layout';
import {Room, RoomTarget} from '../lib/chatTypes';

type Props = {
	channel: Room,
	setToggleMenu: Dispatch<SetStateAction<boolean>>,
	isInvite: boolean
}

export const JoinChannelForm = ({channel, setToggleMenu, isInvite}: Props) => {
	const globalData = useContext(GlobalDataContext)!;

	function submitJoin(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);
		const password = formData.get('password')?.toString();

		joinRoom(globalData.socket, globalData.nickname, channel.name, password);
		setToggleMenu(false);
	}

	return (
		<form
			onSubmit={submitJoin}
			className={styles.joinForm}
		>
			<div className={styles.joinFormHeader}>
				<div className={styles.imageContainerForm}>
					{channel.imagePath &&
						<Image
							src={'http://' + process.env.NEXT_PUBLIC_BACKEND_ENDPOINT + '/social/img' + channel.imagePath}
							alt="" width="10px" height="10px" layout="responsive"
							objectFit="cover"/>
						|| <div className={styles.noImage}><a>{channel.name[0]}</a></div>}
				</div>
				<div className={stylesPreview.chatAreaHeaderInfo}>
					<h2>{channel.name}</h2>
					<a style={{'visibility': channel.topic ? "visible" : "collapse"} as React.CSSProperties}>{channel.topic}</a>
				</div>
			</div>
			<div className={styles.joinFormFooter}>
				{!isInvite && channel.hasPassword &&
					<input name="password" type="password" placeholder={"Insert Password"} required/>}
				<button type="submit">JOIN</button>
			</div>
		</form>
	)
}