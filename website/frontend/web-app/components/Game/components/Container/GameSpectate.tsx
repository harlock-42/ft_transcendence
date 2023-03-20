import AGameComponentContainer from "../Utils/LayoutComponentGame";
import specStyles from "../../../../styles/game/GameSpectate.module.scss";
import GameMenuMaster from "../../lib/GameMenuMaster";
import React, {useEffect, useRef, useState} from "react";
import GameSpecButton from "../Utils/GameSpecButton";
import GameMaster, {GamesInfo} from "../../lib/GameMaster";

type GameSpectateProp = {
    MenuMaster: GameMenuMaster,
}

const GameSpectate = ({MenuMaster}:GameSpectateProp) => {
    let cmpMounted = useRef(false);
    const [arrayGames, setArrayGames] = useState<JSX.Element[]>([]);

    function connectToGame(id: number)
    {
        MenuMaster.GameMaster.connectAsSpectToGame(id);
    }

    const displayGamesInfo = (gamesInfo: GamesInfo[]): void => {
        const list = [];
        for (let i = 0; i < gamesInfo.length; ++i)
        {
            list.push(<GameSpecButton key={i} gameInfo={gamesInfo[i]} id={i} btnClicked={connectToGame}/>)
        }
        setArrayGames(list);
    };

    useEffect(()=>
    {
        if (cmpMounted.current)
            return;
        MenuMaster.GameMaster.socketRef.current.emit('getAllGames');
        MenuMaster.GameMaster.DisplayGamesInfos = displayGamesInfo;
        cmpMounted.current = true;
    });

    return (
        <AGameComponentContainer btnTitle={"Back"} funcBtnBack={MenuMaster.GoBack} MenuMaster={MenuMaster}>
            <div className={specStyles.spectateContainer}>
                <h1>Watch a game</h1>
                <div className={specStyles.buttonsContainer}>
                    {arrayGames}
                </div>
            </div>
        </AGameComponentContainer>
    );
}

export default GameSpectate;