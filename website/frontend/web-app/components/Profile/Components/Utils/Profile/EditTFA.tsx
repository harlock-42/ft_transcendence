import Image from "next/image"
import { getCookie } from "cookies-next"
import { Dispatch, FormEvent, SetStateAction, useState } from "react"
import { UserInfo } from "../../../lib/IProfile"
import axios from "axios"
import cmpStyle from "../../../../../styles/NewProfile/profile.module.scss";
import { useRouter } from "next/router"

type Props = {
    userInfo: UserInfo,
    setUserInfo: Dispatch<SetStateAction<UserInfo | null>>
}

export const EditTFA = ({userInfo, setUserInfo}: Props) => {
    const router = useRouter();
    const [TFAStatus, setTFAStatus] = useState<boolean>(userInfo.twoFactorAuth.activate);
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

    function enableTFA() {
        fetch('http://localhost:3000/users/tfa/activate', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${getCookie('token')}`
            }
        })
            .then(() => {
                setTFAStatus(true);
            })
            .catch((error) => {
                switch (error.response.status) {
                    case 400 || 422 || 401:
                        router.push('/login');
                        return;
                    case 404:
                        router.push('/404');
                        break;
                }
            })
    }

    function disableTFA() {
        fetch('http://localhost:3000/users/tfa/unActivate', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${getCookie('token')}`
            }
        })
            .then(() => {
                setTFAStatus(false);
                setUserInfo((userInfo) => {
                    userInfo!.twoFactorAuth.activate = false;
                    return (userInfo);
                })
            })
            .catch((error) => {
                switch (error.response.status) {
                    case 400 || 422 || 401:
                        router.push('/login');
                        return;
                    case 404:
                        router.push('/404');
                        break;
                }
            })
    }

    function getQrCode() {
        fetch('http://localhost:3000/users/tfa/qrcode', {
            headers: {
                'Authorization': `Bearer ${getCookie('token')}`
            }
        })
            .then(async (response) => {
                setQrCodeUrl((await response.json()).qrcodeUrl);
            })
            .catch((error) => {
                switch (error.response.status) {
                    case 400 || 422 || 401:
                        router.push('/login');
                        return;
                    case 404:
                        router.push('/404');
                        break;
                }
            })
    }

    function submitTFAForm(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const code = formData.get('code')?.toString();

        if (code) {
            axios('http://localhost:3000/users/tfa/checkCode', {
                method: 'POST',
                data: {
                    'code': code
                },
                headers: {
                    'Authorization': `Bearer ${getCookie('token')}`
                }
            })
                .then((response) => {
                    if (response.data) {
                        enableTFA();
                        setTFAStatus(true);
                        setQrCodeUrl(null);
                        setUserInfo((userInfo) => {
                            userInfo!.twoFactorAuth.activate = true;
                            return (userInfo);
                        })
                    }
                    else {
                        alert('Wrong code');
                    }
                })
                .catch((error) => {
                    switch (error.response.status) {
                        case 400 || 401:
                            router.push('/login');
                            return;
                        case 404:
                            router.push('/404');
                            break;
                    }
                })
        }
    }

    return (
        <div className={cmpStyle.editProfileInfoCntr}>
            <h2>Two Factor Authentification</h2>
            <div className={cmpStyle.editFormCntr}>
                {!TFAStatus && !qrCodeUrl &&
                <button className={cmpStyle.btnSubmitEdit} onClick={getQrCode}>ACTIVATE TFA</button>}
                {TFAStatus && !qrCodeUrl &&
                <button className={cmpStyle.btnSubmitEdit} onClick={disableTFA}>DESACTIVATE TFA</button>}

                {qrCodeUrl && <form className={cmpStyle.editFormCntr} onSubmit={submitTFAForm}>
                    <div className={cmpStyle.editInputCntr}>
                        <label>TFA Code</label>
                        <input type='text' name='code' placeholder="TFA code"/>
                    </div>
                    <div className={cmpStyle.editInputCntr}>
                        <label>Scan Qr Code</label>
                        <div className={cmpStyle.qrImgCnt}>
                            <Image
                                src={qrCodeUrl}
                                alt={"qrCode"}
                                layout="responsive"
                                width={"100px"}
                                height={"100px"}
                                objectFit="cover"
                            />
                        </div>
                    </div>
                    <button className={cmpStyle.btnSubmitEdit} type='submit' placeholder="Submit code"> Submit</button>
                </form>}
            </div>
        </div>
    )
}