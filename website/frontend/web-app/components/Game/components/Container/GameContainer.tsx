import {useContext, useEffect, useRef, useState} from "react";
import { GlobalDataContext } from "../../../Utils/Layout";

import GameMenuMaster from "../../lib/GameMenuMaster";
import {FriendGameInfo} from "../../lib/GameMaster";

const GameContainer = () => {
    const [, setElement] = useState<JSX.Element>()
    const menuRef = useRef<GameMenuMaster>();
    const globalData = useContext(GlobalDataContext)!;

    useEffect(()=>
    {
        if (menuRef.current == null)
        {
            menuRef.current = new GameMenuMaster(setElement, globalData.nickname);
            const friendGameInfo : FriendGameInfo = JSON.parse(localStorage.getItem('gameRequest')!);
            if (friendGameInfo == null) {
                menuRef.current.DisplayGameMenu();
                return;
            }
            localStorage.removeItem('gameRequest');
            menuRef.current.GameMaster.connectToChallengeRequest(friendGameInfo);
        }
        return () =>
        {
            if (menuRef.current?.GameMaster.socketRef.current.connected) {
                menuRef.current?.GameMaster.QuitGame();
                menuRef.current?.GameMaster.socketRef.current.disconnect();
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [menuRef.current]);
    
    return (
        <>
            {menuRef.current != null && menuRef.current.curElem}
        </>
    );
}

export default GameContainer;