import PropTypes from "prop-types";

// @ts-ignore
const Button = ({className, text, onClick}) => {
    return (
        <button
            onClick={onClick}
            className={className}
        >
            {text}
        </button>
    );
}

Button.defaultProps = {
    className : 'null',
    text: 'NULL',
}

Button.propTypes = {
    className: PropTypes.string,
    text: PropTypes.string,
    onClick: PropTypes.func.isRequired,
}

export default Button;