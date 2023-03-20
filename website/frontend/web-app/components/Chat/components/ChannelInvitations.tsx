import {Dispatch, SetStateAction, useContext, useEffect, useState} from 'react';
import styles from '../../../styles/chat/Channels.module.scss'
import {GlobalDataContext} from '../../Utils/Layout';
import {Room} from '../lib/chatTypes';
import {JoinChannelForm} from './JoinChannelForm';
import Image from 'next/image';

type Props = {
	setToggleMenu: Dispatch<SetStateAction<boolean>>
}

export const ChannelInvitations = ({setToggleMenu}: Props) => {
	const globalData = useContext(GlobalDataContext)!;
	const [channels, setChannels] = useState<Room[]>([]);
	const [curChannelPreview, setCurChannelPreview] = useState<Room | null>(null);

	useEffect(() => {
		globalData.socket.emit('getChannelInvites', globalData.nickname, (newChannels: Room[]) => {
			setChannels(newChannels);
		})
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	if (channels.length > 0) {
		return (
			<div className={styles.searchChannelPanel}>
				<div className={styles.searchChannelHeader}>
					{curChannelPreview &&
						<JoinChannelForm channel={curChannelPreview} isInvite={true} {...{setToggleMenu}}/>}
				</div>
				<div className={styles.resultList}>
					{channels.map((channel: Room) => {
						return (
							<div className={styles.searchChannelBox}
								 onClick={() => {
									 setCurChannelPreview(channel);
								 }}
								 key={channel.name}
							>
								<div className={styles.imageContainerForm}>
									{channel.imagePath &&
										<Image
											src={'http://' + process.env.NEXT_PUBLIC_BACKEND_ENDPOINT + '/social/img' + channel.imagePath}
											alt="" width="10px" height="10px" layout="responsive"
											objectFit="cover"/>
										|| <div className={styles.noImage}><a>{channel.name[0]}</a></div>}
								</div>
								<a>{channel.name}</a>
							</div>
						);
					})}
				</div>
			</div>
		)
	}
	else {
		return (<div className={styles.searchChannelPanel}></div>);
	}
}