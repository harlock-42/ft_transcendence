import { setCookie } from "cookies-next"
import { useRouter } from "next/router"
import { FormEvent } from "react"
import styleConnect from "../../styles/chat/Connect.module.scss";

type Props = {
    loadLogin: () => void
}

export const RegisterContainer = ({loadLogin}: Props) => {
	const router = useRouter()

	async function submitRegister(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()
        const formData = new FormData(event.currentTarget);

		const data = {
			nickname: formData.get('nickname')!.toString(),
			password: formData.get('password')!.toString()
		}
		fetch('http://localhost:3000/auth/register/local', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		})
        .then(async (response) => {
            const token = await response.json();
            setCookie('token', token.token)
            router.push('/')
        })
        .catch((error) => {
            //TODO throw error in case of already existing nickname !!!
        })

	}
    return (
        <>
            <h1>Register</h1>
            <form className={styleConnect.loginInputsCnt} onSubmit={submitRegister}>
                <div className={styleConnect.loginInputCnt}>
                    <label>User Name</label>
                    <input type="text" name="nickname" placeholder="nickname..." required={true}/>
                </div>
                <div className={styleConnect.loginInputCnt}>
                    <label>Password</label>
                    <input type="text" name="password" placeholder="password..." required={true}/>
                </div>
                <button className={styleConnect.buttons} type="submit">REGISTER</button>
            </form>
            <button className={styleConnect.buttons} onClick={loadLogin}>Go Back To Login</button>
        </>
    );
}