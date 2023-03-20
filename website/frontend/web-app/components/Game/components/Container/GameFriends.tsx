import AGameComponentContainer from "../Utils/LayoutComponentGame";
import specStyles from "../../../../styles/game/GameSpectate.module.scss";
import GameMenuMaster from "../../lib/GameMenuMaster";
import React, {useEffect, useRef, useState} from "react";
import GameSpecButton from "../Utils/GameSpecButton";
import {FriendGameInfo} from "../../lib/GameMaster";
import FriendGameButton from "../Utils/FriendGameButton";

type FriendGamesProp = {
    MenuMaster: GameMenuMaster,
}




const FriendGames = ({MenuMaster}: FriendGamesProp) => {
    let cmpMounted = useRef(false);
    const [arrayGames, setArrayGames] = useState<JSX.Element[]>([]);

    function connectToGame(gameInfo: FriendGameInfo)
    {
        MenuMaster.GameMaster.connectToChallengeRequest(gameInfo);
    }

    const displayFriendsGamesInfo = (gamesInfo: FriendGameInfo[]): void => {
        const list : JSX.Element[] = [];
        for (let i = 0; i < gamesInfo.length; ++i)
        {
            if (gamesInfo[i].sender == MenuMaster.GameMaster.NickName ||
                gamesInfo[i].target == MenuMaster.GameMaster.NickName)
                    list.push(<FriendGameButton key={i} info={gamesInfo[i]} btnClicked={connectToGame} GameMaster={MenuMaster.GameMaster}/>)
        }
        setArrayGames(list);
    };

    useEffect(()=>
    {
        if (cmpMounted.current)
            return;
        
        MenuMaster.GameMaster.socketRef.current.emit('getAllFriendsGame', MenuMaster.GameMaster.NickName);
        MenuMaster.GameMaster.DisplayGamesInfos = displayFriendsGamesInfo;
        cmpMounted.current = true;
    });

    return (
        <AGameComponentContainer btnTitle={"Back"} funcBtnBack={MenuMaster.DisplayGamePlay} MenuMaster={MenuMaster}>
            <div className={specStyles.spectateContainer}>
                <h1>Play with a friend</h1>
                <div className={specStyles.buttonsContainer}>
                    {arrayGames}
                </div>
            </div>
        </AGameComponentContainer>
    );
}

export default FriendGames;