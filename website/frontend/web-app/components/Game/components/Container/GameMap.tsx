import AGameComponentContainer from "../Utils/LayoutComponentGame";
import menuStyles from "../../../../styles/game/GameMenu.module.scss";
import GameMenuMaster from "../../lib/GameMenuMaster";
import GameMaster from "../../lib/GameMaster";
import {ReactNode} from "react";

type GameMapProps = {
    title: string,
    gameMode: boolean,
    MenuMaster: GameMenuMaster,
}

const GameMap = ({title, gameMode, MenuMaster}: GameMapProps) =>
{
    function requestGameToServer(mapMode:boolean)
    {
        MenuMaster.GameMaster.ConnectToGame(mapMode, gameMode);
    }

    return(
        <AGameComponentContainer btnTitle={"Back"} funcBtnBack={MenuMaster.DisplayGamePlay} MenuMaster={MenuMaster}>
            <div className={menuStyles.menuContainer}>
                <h2>{title}</h2>
                <div className={menuStyles.btnContainer}>
                    <div className={menuStyles.buttons} onClick={() => requestGameToServer(false)}>
                        <div/>
                        <span className={menuStyles.btnTitle}>Classic</span>
                    </div>
                    <div className={menuStyles.buttons} onClick={() => requestGameToServer(true)}>
                        <div/>
                        <span className={menuStyles.btnTitle}>Obstacles</span>
                    </div>
                </div>
            </div>
        </AGameComponentContainer>
    );
}

export default GameMap;