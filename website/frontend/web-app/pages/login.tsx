import { NextPage } from "next";
import { useState } from "react";
import { LoginContainer } from "../components/Login/LoginContainer";
import { RegisterContainer } from "../components/Login/RegisterContainer";
import styleConnect from "../styles/chat/Connect.module.scss";

const Login: NextPage = () => {
    const [curElement, setElement] = useState<JSX.Element>(<LoginContainer {...{loadRegister}}/>);

    function loadLogin() {
        setElement(<LoginContainer {...{loadRegister}}/>)
    }

    function loadRegister() {
        setElement(<RegisterContainer {...{loadLogin}}/>);
    }

    return (
        <div className={styleConnect.loginCnt}>
            {curElement}
        </div>
    );
}

export default Login;
