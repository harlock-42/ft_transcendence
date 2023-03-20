import {Dispatch, SetStateAction} from 'react';
import styles from '../../../styles/chat/Channels.module.scss'
import {Message, Room, RoomTarget} from '../lib/chatTypes';
import {ChannelFooter} from './ChannelFooter';
import {ChannelList} from './ChannelList';

type Props = {
	curRoom: RoomTarget | null,
	displayDm: boolean,
	setCurRoom: Dispatch<SetStateAction<RoomTarget | null>>,
	setMessages: Dispatch<SetStateAction<Message[]>>,
	setDisplayDm: Dispatch<SetStateAction<boolean>>,
	channels: Room[]
}

export const ChannelArea = ({curRoom, displayDm, setCurRoom, setMessages, setDisplayDm, channels}: Props) => {
	function enterDM() {
		setCurRoom(null);
		setMessages([]);
		setDisplayDm(true);
	}

	return (
		<div className={styles.channelsContainer}>
			<div className={styles.dmContainer}
				 onClick={enterDM}
			>
				<a className={styles.channelButtonContainer + (displayDm ? " " + styles.channelButtonContainerActive : "")}>DM</a>
			</div>
			<ChannelList {...{curRoom, setCurRoom, setMessages, channels, setDisplayDm}} />
			<ChannelFooter {...{setCurRoom}} />
		</div>
	);
}