import { Dispatch, MutableRefObject, SetStateAction, useEffect, useRef } from 'react'
import styles from '../../../styles/chat/PopUp.module.scss'
import { PopUp } from '../lib/chatTypes'

type Props = {
    popUp: PopUp;
    setPopUps: Dispatch<SetStateAction<PopUp[]>>;
}

export const PopUpBox = ({ popUp, setPopUps }: Props) => {
    const refCompLoaded: MutableRefObject<boolean | undefined> = useRef<boolean>(false);

    useEffect(() => {
        if (!refCompLoaded.current) {
            setTimeout(() => {
                setPopUps((popUps: PopUp[]) => popUps.filter((element: PopUp) => {
                    return (element.id !== popUp.id);
                }))
            }, 5000)
            refCompLoaded.current = true;
        }
    }, [popUp.id, setPopUps])

    return (
        <div className={styles.popUp}>
            <h2>{popUp.text}</h2>
        </div>
    )
}