import specStyles from "../../../../styles/game/GameSpectate.module.scss";
import PropTypes from "prop-types";
import React from "react";
import GameMaster, {FriendGameInfo} from "../../lib/GameMaster";

type FriendGameButtonProp = {
    info : FriendGameInfo,
    btnClicked: (info: FriendGameInfo)=>void,
    GameMaster: GameMaster,
} 
const FriendGameButton = ({info, btnClicked, GameMaster}: FriendGameButtonProp) =>
{
    return (
        <div className={specStyles.spectateButton} onClick={() => btnClicked(info)}>
            <span/>
            <a>{GameMaster.NickName == info.sender ? info.target : info.sender}</a>
        </div>
    );
}

FriendGameButton.defaultProps = {
    info: null,
    btnClicked: null,
}

FriendGameButton.propTypes = {
    info : PropTypes.object,
    btnClicked: PropTypes.func,
}

export default FriendGameButton;