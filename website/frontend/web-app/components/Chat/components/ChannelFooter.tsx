import { Dispatch, SetStateAction, useRef, useState } from 'react';
import styles from '../../../styles/chat/Channels.module.scss'
import { RoomTarget } from '../lib/chatTypes';
import { ChannelMenu } from './ChannelMenu';
import Image from "next/image";
import Add from "../../../public/utils/noun-add.svg";

type Props = {
    setCurRoom: Dispatch<SetStateAction<RoomTarget | null>>
}

export const ChannelFooter = ({setCurRoom}: Props) => {
    const [toggleMenu, setToggleMenu] = useState(false);

    return (
        <div className={styles.channelFooterBtn}>
            <div className={styles.div_img} onClick={() => {setToggleMenu(!toggleMenu)}}>
                <Image
                    src={Add}
                    alt="Account"
                    layout="responsive"
                    objectFit="contain"
                />
            </div>
            {toggleMenu && <ChannelMenu {...{setCurRoom, setToggleMenu}}/>}
        </div>
    );
}