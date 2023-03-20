import { useRouter } from "next/router";
import { useRef } from "react";
import styleConnect from '../../styles/chat/Connect.module.scss'
import axios, { AxiosPromise } from "axios";
import { getCookie, setCookie } from "cookies-next";
import Image from "next/image";
import Friends from "../../public/utils/logo_42.svg";

type Props = {
    loadRegister: () => void
}

export const LoginContainer = ({loadRegister}: Props) => {
    const inputNickRef = useRef<HTMLInputElement | null>(null);
    const inputPassRef = useRef<HTMLInputElement | null>(null);
    const router = useRouter();
    const loginUrl = process.env.NEXT_PUBLIC_API_LOGIN_URL!;

    async function Login() {
        if (inputNickRef.current != null && inputNickRef.current.value != ""
            && inputPassRef.current != null && inputPassRef.current.value != "") {
            const data = {
                username: inputNickRef.current.value,
                password: inputPassRef.current.value
            }
            axios({
                url: 'http://localhost:3000/auth/login/local',
                method: 'post',
                data: data
            })
                .then((resolve) => {
                    setCookie('token', resolve.data.token);
                    router.push('/');
                })
                .catch((error) => {
                    switch (error.response.status) {
                        case 401:
                            alert('Bad credentials');
                            return;
                    }
                })
        }
    }

    function APILogin() {
        router.push(loginUrl);
    }

    return (
        <>
                <h1>Login</h1>
                <div className={styleConnect.loginInputsCnt}>
                    <div className={styleConnect.loginInputCnt}>
                    <label>User Name</label>
                    <input ref={inputNickRef} type="text" placeholder="username"/>
                    </div>
                    <div className={styleConnect.loginInputCnt}>
                    <label>Password</label>
                    <input ref={inputPassRef} type="password" placeholder="password"/>
                    </div>
                    <div className={styleConnect.formButtonCnt}>
                        <button className={styleConnect.buttons} onClick={Login}>
                            Login
                        </button>
                        <button className={styleConnect.buttons} onClick={loadRegister}>
                            Register
                        </button>
                    </div>
                </div>
                <div className={styleConnect.loginButtonCnt}>

                    <button className={styleConnect.buttonsImg} onClick={APILogin}>
                        <Image
                            src={Friends}
                            alt="Account"
                            layout="responsive"
                            objectFit="contain"
                        />
                    </button>
                </div>
        </>
    );
}