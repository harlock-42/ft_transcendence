import {ReactNode} from "react";
import Button from "./Button";
import cmpStyle from "../../../../styles/game/AGameComponent.module.scss";
import GameMenuMaster from "../../lib/GameMenuMaster";


type AGameComponentProps = {
    children?: ReactNode,
    btnTitle?: string,
    funcBtnBack?: void | any,
    MenuMaster: GameMenuMaster,
}

const AGameComponentContainer = ({children, funcBtnBack, btnTitle, MenuMaster}: AGameComponentProps) =>
{
    return (
        <div className={cmpStyle.gameCmpContainer}>
            <div className={cmpStyle.childContainer}>
                {children}
            </div>
            <div className={cmpStyle.btnBackContainer}>
                {!btnTitle?.includes("Menu") && <Button className={cmpStyle.btnBack} text={"Info"} onClick={MenuMaster.DisplayGameInfo}/>}
                {funcBtnBack != undefined && <Button className={cmpStyle.btnBack} text={btnTitle != undefined ? btnTitle : "Back"} onClick={funcBtnBack}/>}
            </div>
        </div>
    );
}

export default AGameComponentContainer;