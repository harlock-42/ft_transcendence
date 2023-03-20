import AGameComponentContainer from "../Utils/LayoutComponentGame";
import menuStyles from "../../../../styles/game/GameMenu.module.scss";
import GameMenuMaster from "../../lib/GameMenuMaster";

type GamePlayProp = {
    MenuMaster: GameMenuMaster,
}

const GamePlay = ({MenuMaster}: GamePlayProp) =>
{
    return (
        <AGameComponentContainer btnTitle={"Back"} funcBtnBack={MenuMaster.DisplayGameMenu} MenuMaster={MenuMaster}>
            <div className={menuStyles.menuContainer}>
                <h1>Play</h1>
                <div className={menuStyles.btnContainer}>
                    <div className={menuStyles.buttons} onClick={MenuMaster.DisplayGameSinglePlayer}>
                        <span/>
                        <span className={menuStyles.btnTitle}>Solo</span>
                    </div>
                    <div className={menuStyles.buttons} onClick={MenuMaster.DisplayGameMultiplayer}>
                        <span/>
                        <span className={menuStyles.btnTitle}>Multiplayer</span>
                    </div>
                    <div className={menuStyles.buttons} onClick={MenuMaster.DisplayGameFriend}>
                        <span/>
                        <span className={menuStyles.btnTitle}>Friends Game</span>
                    </div>
                </div>
            </div>
        </AGameComponentContainer>
    );
}

export default GamePlay;