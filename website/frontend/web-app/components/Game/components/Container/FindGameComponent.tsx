import styles from '../../../../styles/game/WaitingGame.module.scss'
import AGameComponentContainer from "../Utils/LayoutComponentGame";
import GameMenuMaster from "../../lib/GameMenuMaster";
import GameMaster from "../../lib/GameMaster";

type FindGameProp = {
    MenuMaster: GameMenuMaster,
}

const FindGameComponent = ({MenuMaster} : FindGameProp) => {

    function CancelRequest()
    {
        MenuMaster.GameMaster.DisconnectFromGameServices();
        MenuMaster.DisplayGamePlay();
    }

    return (
        <AGameComponentContainer btnTitle={"Back"} funcBtnBack={CancelRequest} MenuMaster={MenuMaster}>
            <div className={styles.containerWaiting}>
                <div className={styles.waviy}>
                    <span style={{'--i': 1} as React.CSSProperties}>F</span>
                    <span style={{'--i': 2} as React.CSSProperties}>I</span>
                    <span style={{'--i': 3} as React.CSSProperties}>N</span>
                    <span style={{'--i': 4} as React.CSSProperties}>D</span>
                    <span style={{'--i': 5} as React.CSSProperties}>I</span>
                    <span style={{'--i': 6} as React.CSSProperties}>N</span>
                    <span style={{'--i': 7} as React.CSSProperties}>G</span>
                    &nbsp;&nbsp;&nbsp;
                    &nbsp;&nbsp;&nbsp;
                    &nbsp;&nbsp;&nbsp;
                    <span style={{'--i': 8} as React.CSSProperties}>G</span>
                    <span style={{'--i': 9} as React.CSSProperties}>A</span>
                    <span style={{'--i': 10} as React.CSSProperties}>M</span>
                    <span style={{'--i': 11} as React.CSSProperties}>E</span>
                    <span style={{'--i': 12} as React.CSSProperties}>.</span>
                    <span style={{'--i': 13} as React.CSSProperties}>.</span>
                    <span style={{'--i': 14} as React.CSSProperties}>.</span>
                </div>
            </div>
        </AGameComponentContainer>
    )
}

export default FindGameComponent;