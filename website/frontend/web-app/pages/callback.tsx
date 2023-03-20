import { setCookie } from "cookies-next"
import CheckTfa from "../components/Utils/checkTfa";
import Redirect from "../components/Utils/Redirect";

export async function getServerSideProps({query}: any) {
    if (!query || !query.code) {
        return {
            props: {
                token: null,
                tfa: null
            }
        }
    }

	const response = await fetch('http://' + process.env.NEXT_PUBLIC_BACKEND_ENDPOINT + '/auth/callback', {
		headers: {
			jwt: query.code
		}
	})

	const data = await response.json()
	const str = data['access_token']
	const tfa = data['tfa']
	return {
		props: {
			token : str,
			tfa
		}
	}
}

function callback({ token, tfa }: any) {
    if (!token) {
        return (
            <Redirect to={"/404"}></Redirect>
        )
    }
	if (tfa === true) {
		return (
            <CheckTfa {...{token}}/>
        )
	}
    setCookie('token', token.token, {
		sameSite: 'lax'
	});
    return <Redirect to={"/"}></Redirect>
}

export default callback;