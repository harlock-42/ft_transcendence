import axios from "axios";
import {  setCookie } from "cookies-next";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

export default function CheckTfa({ token }: { token: any }) {
    const [check, setCheck] = useState<boolean>(false)
    const codeRef = useRef<HTMLInputElement | null>(null)
    const router = useRouter()

    useEffect(() => {
        async function fetchData() {
            if (codeRef && codeRef.current && codeRef.current.value !== '') {
                const response = await axios('http://localhost:3000/users/tfa/checkCode', {
                    method: 'POST',
                    data: {
                        'code': codeRef.current.value
                    },
                    headers: {
                        'Authorization': `Bearer ${token.token}`
                    }
                })
                switch (response.status) {
                    case 400 || 401:
                        router.push('login');
                        return;
                    case 404:
                        router.push('/404');
                        return;
                }
                setCheck(false)
                if (response.data === false) {
                    alert('Wrong code');
                    return;
                } else {
                    router.push('/');
                    return;
                }
            }
        }
        if (check === true) {
            setCookie("token", token.token)
            fetchData()
            router.push('/')
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [check])
    return (
        <div>
            <input
                type="text"
                name="code"
                placeholder="code"
                autoFocus={true}
                ref={codeRef}
                required={true}
            >
            </input>
            <button
                onClick={() => {
                    setCheck(true)
                }}
            >
                submit
            </button>
        </div>
    );
}