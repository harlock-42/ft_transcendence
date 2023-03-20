import AGameComponentContainer from "../Utils/LayoutComponentGame";
import infoStyles from "../../../../styles/game/GameInfo.module.scss";
import GameMenuMaster from "../../lib/GameMenuMaster";

type GameInfoProp = {
    MenuMaster: GameMenuMaster,
}

const GameInfo = ({MenuMaster}: GameInfoProp) => {

    return (
        <AGameComponentContainer btnTitle={"Back"} funcBtnBack={MenuMaster.GoBack} MenuMaster={MenuMaster}>
            <div className={infoStyles.infoContainer}>
                <h1>Info</h1>
                <div className={infoStyles.textContainer}>
                    <div><h3>How To play</h3><p>Move the mouse up or down inside the screen in order to move the pad</p></div>
                    <div><h3>Game Modes</h3><p>You have the choice of two games mode<br/><br/>&gt;  Classic being the classical map of pong<br/>&gt;  Obstacles being a custom map where there are object that obstructs the ball movement</p></div>
                </div>
            </div>
        </AGameComponentContainer>
    );
}

export default GameInfo;
