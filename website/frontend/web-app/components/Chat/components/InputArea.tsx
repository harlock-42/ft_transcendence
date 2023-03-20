import { Dispatch, SetStateAction, useContext, useRef } from 'react';
import styles from '../../../styles/chat/Messages.module.scss'
import { sendChatText } from '../lib/chatQuery';
import { ChatCLI } from '../lib/chatCLI';
import { PopUp, RoomTarget } from '../lib/chatTypes';
import { GlobalDataContext } from '../../Utils/Layout';
import Image from "next/image";
import Friends from "../../../public/utils/noun-send-3264453.svg";

type Props = {
    curRoom: RoomTarget | null,
    setPopUps: Dispatch<SetStateAction<PopUp[]>>
}

export const InputArea = ({curRoom, setPopUps}: Props) => {
    const globalData = useContext(GlobalDataContext)!;

    const inputMessageRef = useRef<HTMLInputElement | null>(null);
    const chatCLI = new ChatCLI();

    function sendMessage() {
        if (inputMessageRef.current && inputMessageRef.current.value) {
            if (inputMessageRef.current.value[0] === '/') {
                chatCLI.parseCommand(globalData.socket, globalData.nickname, curRoom, inputMessageRef.current.value, setPopUps);
            }
            else {
                sendChatText(globalData.socket, globalData.nickname, inputMessageRef.current.value, curRoom)
            }
            inputMessageRef.current.value = "";
        }
    }

    return (
            <div className={styles.inputArea}>
                <input
                    className={styles.inputMessage}
                    ref={inputMessageRef}
                    placeholder="Type here ..."
                    type="text"
                    maxLength={100}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                            sendMessage();
                        }
                    }}
                />
                <button
                    className={styles.sendButton}
                    onClick={() => sendMessage()}
                >
                    <Image
                        src={Friends}
                        alt="Account"
                        layout="responsive"
                        objectFit="contain"
                    />
                </button>
            </div>
    );
}