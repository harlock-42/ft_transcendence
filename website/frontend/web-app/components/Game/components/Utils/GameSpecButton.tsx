import specStyles from "../../../../styles/game/GameSpectate.module.scss";
import PropTypes from "prop-types";
import React from "react";
import {GamesInfo} from "../../lib/GameMaster";


type GameSpecButtonProp = {
    gameInfo : GamesInfo,
    id : number
    btnClicked: (id: number)=>void,
}

const GameSpecButton = ({gameInfo,id, btnClicked}: GameSpecButtonProp) =>
{
    return (
    <div className={specStyles.spectateButton} onClick={() => btnClicked(id)}>
        <span/>
        <a>{gameInfo.Player1NickName} vs {gameInfo.Player2NickName}</a>
    </div>
    );
}

GameSpecButton.defaultProps = {
    id : -1,
}

GameSpecButton.propTypes = {
    id: PropTypes.number.isRequired,
    btnClicked: PropTypes.func,
}

export default GameSpecButton;