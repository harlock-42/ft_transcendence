import AGameComponentContainer from "../Utils/LayoutComponentGame";
import menuStyles from '../../../../styles/game/GameMenu.module.scss'
import {useEffect} from "react";
import GameMenuMaster from "../../lib/GameMenuMaster";

type GameMenuProp = {
    MenuMaster: GameMenuMaster,
}


const GameMenu = ({MenuMaster}: GameMenuProp) => {


    return (
    <AGameComponentContainer funcBtnBack={undefined} MenuMaster={MenuMaster}>
        <div className={menuStyles.menuContainer}>
            <h1>Pong</h1>
            <div className={menuStyles.btnContainer}>
                <div className={menuStyles.buttons} onClick={MenuMaster.DisplayGamePlay}>
                    <span/>
                    <span className={menuStyles.btnTitle}>Play</span>
                </div>
                <div className={menuStyles.buttons} onClick={MenuMaster.DisplayGameSpectate}>
                    <span/>
                    <span className={menuStyles.btnTitle}>Spectate</span>
                </div>
            </div>
        </div>
    </AGameComponentContainer>
    );
}

export default GameMenu;