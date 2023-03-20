import styles from '../../../styles/chat/Channels.module.scss'
import { CreateChannelForm } from "./CreateChannelForm";
import { SearchChannel } from "./SearchChannel";
import { Dispatch, SetStateAction, useState } from "react";
import { RoomTarget } from "../lib/chatTypes";
import { ChannelMenuTabs } from "./ChannelMenuTabs";
import { ChannelInvitations } from "./ChannelInvitations";
import Image from "next/image";
import LoginImg from "../../../public/utils/noun-denied.svg";

type Props = {
    setCurRoom: Dispatch<SetStateAction<RoomTarget | null>>,
    setToggleMenu: Dispatch<SetStateAction<boolean>>
}

export enum ChannelMenuTab {
    CREATE,
    SEARCH,
    INVITATIONS
}

export const ChannelMenu = ({setCurRoom, setToggleMenu}: Props) => {
    const [curTab, setCurTab] = useState<ChannelMenuTab>(ChannelMenuTab.CREATE);

    return (
        <div className={styles.channelMenu}>
            <div className={styles.channelMenuHeader}>
                <ChannelMenuTabs {...{setCurTab}} />
                <button
                     className={styles.closeChannelMenuButton}
                    onClick={() => setToggleMenu(false)}
                >
                    <Image
                        src={LoginImg}
                        alt="Account"
                        layout="responsive"
                        objectFit="contain"
                    />
                </button>
            </div>
            {curTab === ChannelMenuTab.CREATE && <CreateChannelForm {...{setCurRoom, setToggleMenu}} />}
            {curTab === ChannelMenuTab.SEARCH && <SearchChannel {...{setToggleMenu}} />}
            {curTab === ChannelMenuTab.INVITATIONS && <ChannelInvitations {...{setToggleMenu}} />}
        </div>
    )
}