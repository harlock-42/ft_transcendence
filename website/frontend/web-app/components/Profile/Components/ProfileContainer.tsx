import {GlobalDataContext} from '../../Utils/Layout';
import {useContext, useEffect, useRef, useState} from "react";
import AllMatches from "./Utils/Matches/AllMatches";
import AllAchievements from "./Utils/Achivments/AllAchievements";
import EditProfile from "./Utils/Profile/EditProfile";
import ProfileBox from "./Utils/Profile/ProfileBox";
import { useRouter } from 'next/router';
import { getCookie } from 'cookies-next';
import axios from 'axios';
import { UserInfo } from '../lib/IProfile';


const ProfileContainer = () => {
    const globalData = useContext(GlobalDataContext)!;
    const [curElement, setElement] = useState<JSX.Element | null>(null);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const infoFetchedRef = useRef(false);
    const router = useRouter();

    useEffect(() => {
        if (userInfo && userInfo.nickname === router.query.id) {
            loadProfile(userInfo);
        }
        else if (!infoFetchedRef.current) {
            console.log('assign user data!');
            console.log('pathname: ', router.pathname, 'query id: ', router.query.id);
	  	    assignUserData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userInfo, router.query.id]);

    async function assignUserData() {
        axios.get('http://localhost:3000/users/profil/' + router.query.id, {
            headers: {
                'Authorization': `Bearer ${getCookie('token')}`
            }
        })
        .then((response) => {
            console.log('then');
            setUserInfo((userInfo) => {
                userInfo = response.data;
                userInfo!.matchs.reverse();
                userInfo!.myNickname = globalData.nickname;
                userInfo!.image = "http://" + process.env.NEXT_PUBLIC_BACKEND_ENDPOINT +  "/users/img/" + userInfo!.imgUrl;
                return (userInfo);
            });
        })
        .catch((error) => {
            switch (error.response.status) {
                case 422:
                    router.push('/login');
                    return;
                case 400 || 403 || 404:
                    router.push('/404');
                    return;
            }
        })
        infoFetchedRef.current = true;
    }

	const loadProfile = (userInfo: UserInfo) => {
		setElement(<ProfileBox {...{userInfo, setUserInfo, loadEditMode, loadAllAchievements, loadAllMatches}} />)
	}

	const loadEditMode = (userInfo: UserInfo) => {
		setElement(<EditProfile {...{userInfo, setUserInfo, loadProfile}}/>)
	}

	const loadAllAchievements = () => {
		setElement(<AllAchievements {...{userInfo, loadProfile}}/>)
	}

	const loadAllMatches = () => {
		setElement(<AllMatches {...{userInfo, loadProfile}}/>)
	}

	return (
		<>
			{curElement !== null && curElement}
		</>
	)
}

export default ProfileContainer;