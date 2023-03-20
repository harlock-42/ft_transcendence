import React from "react";
import PropTypes from "prop-types";
import Button from "./Button";

// @ts-ignore
const ToggleButton = ({state, className, texts}) =>
{
    const [buttonText, setButtonText] = React.useState(texts[0]);
    function handleClick() {
        if (buttonText.match(texts[1])) {
            setButtonText(texts[0]);
            state.current = false;
        }
        else {
            setButtonText(texts[1]);
            state.current = true;
        }
    }
    return(
        <Button className={className} onClick={handleClick} text={buttonText}/>
    );
}

ToggleButton.defaultProps = {
    className : 'null',
    initialText : 'null',
    secdText: 'null',
}

ToggleButton.propTypes = {
    id : PropTypes.string,
    className: PropTypes.string,
    texts : PropTypes.array.isRequired,
}

export default ToggleButton;