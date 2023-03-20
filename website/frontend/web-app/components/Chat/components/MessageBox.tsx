import { useContext, useState } from 'react';
import styles from '../../../styles/chat/Messages.module.scss'
import { Avatar } from '@mui/material';
import { GlobalDataContext } from '../../Utils/Layout';
import Image from "next/image";
import { Message } from '../lib/chatTypes';

type Props = {
    message: Message
}

export const MessageBox = ({message}: Props) => {
    const globalData = useContext(GlobalDataContext)!;
    const [side, setSide] = useState(message.senderNickname === globalData.nickname);

    function formatDate(): string {
        const dateObj = new Date();
        dateObj.setTime(message.date);
        const day = dateObj.getDate();
        const month = dateObj.getMonth() + 1;
        const year = dateObj.getFullYear();
        const hours = dateObj.getHours();
        const minutes = dateObj.getMinutes();

        return (day + '/' + month + '/' + year + " " + hours + ":" + minutes);
    }

    return (
        <div className={`${side ? styles.messageBoxRight : styles.messageBoxLeft}`}>
            <div className={styles.messageHeader}>
                <a className={styles.messageName}>{message.senderNickname}</a>
                <a className={styles.messageDate}>{formatDate()}</a>
            </div>
            <div className={styles.messageBody}>
                <a className={styles.messageText}>{message.text}</a>
            </div>
        </div>
    );
}