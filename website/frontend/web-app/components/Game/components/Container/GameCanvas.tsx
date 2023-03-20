import AGameComponentContainer from "../Utils/LayoutComponentGame";
import gameStyles from "../../../../styles/game/GameCanvas.module.scss";
import React, {useEffect, useRef} from "react";
import GameMenuMaster from "../../lib/GameMenuMaster";
import GameDisplay from "../../lib/GameDisplay";
import GameMaster from "../../lib/GameMaster";

type GameCanvasProp = {
    MenuMaster: GameMenuMaster,
}

const GameCanvas = ({MenuMaster}: GameCanvasProp) => {

    const mounted = useRef<boolean>(false);

    useEffect(() =>
    {
        if (mounted.current)
            return;

        MenuMaster.GameMaster.GameDisplay.handleResizeBound();
        MenuMaster.GameMaster.AddEventListeners();
        mounted.current = true;
    });

    function CloseGameSession()
    {
        MenuMaster.GameMaster.QuitGame();
    }

    return (
        <AGameComponentContainer btnTitle={"Menu"} funcBtnBack={CloseGameSession} MenuMaster={MenuMaster}>
            <div className={gameStyles.canvasContainer} ref = { MenuMaster.GameMaster.GameDisplay.parentRef}>
                <canvas ref = { MenuMaster.GameMaster.GameDisplay.refCanvas} height={480} width={640}/>
            </div>
        </AGameComponentContainer>
    );
}

export default GameCanvas;