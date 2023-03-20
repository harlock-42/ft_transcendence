import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import styles from '../../../styles/chat/PopUp.module.scss'
import { PopUp } from '../lib/chatTypes';
import { PopUpBox } from './PopUp';

type Props = {
    popUps: PopUp[];
    setPopUps: Dispatch<SetStateAction<PopUp[]>>;
}

export const PopUpContainer = ({ popUps, setPopUps }: Props) => {
    return (
        <div className={styles.popUpContainer}>
            {popUps.map((popUp: PopUp) => {
                return (
                    <PopUpBox {...{ popUp, setPopUps }} key={popUp.id} />
                )
            })}
        </div>
    );
}