import {Dispatch, MutableRefObject, SetStateAction, useRef} from "react"
import { ChannelMenuTab } from "./ChannelMenu"
import styles from "../../../styles/chat/Channels.module.scss"

type Props = {
    setCurTab: Dispatch<SetStateAction<ChannelMenuTab>>
}

export const ChannelMenuTabs = ({setCurTab}: Props) => {

    const refCurrentButton : MutableRefObject<HTMLButtonElement | null> = useRef<HTMLButtonElement>(null);

    function updateCurTab(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        refCurrentButton.current?.classList.toggle(styles.channelMenuToggleButtonActive)
        event.currentTarget.classList.toggle(styles.channelMenuToggleButtonActive)
        refCurrentButton.current = event.currentTarget;
    }

    return (
        <div className={styles.containerChannelToggleMenu}>
            <button ref={refCurrentButton}
                    className={styles.channelMenuToggleButtonActive}
                onClick={(event) => {
                    if (refCurrentButton.current !== event.currentTarget) {
                        updateCurTab(event);
                        setCurTab(ChannelMenuTab.CREATE)
                    }
                }}
            >CREATE</button>
            <button
                onClick={(event) =>{
                    if (refCurrentButton.current !== event.currentTarget) {
                        updateCurTab(event);
                        setCurTab(ChannelMenuTab.SEARCH)
                    }
                }}
            >SEARCH</button>
            <button
                onClick={(event) =>{
                    if (refCurrentButton.current !== event.currentTarget) {
                        updateCurTab(event);
                        setCurTab(ChannelMenuTab.INVITATIONS)
                    }
                }}
            >INVITATIONS</button>
        </div>
    )
}