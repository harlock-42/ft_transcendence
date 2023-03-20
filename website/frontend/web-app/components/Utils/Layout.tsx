import { getCookie } from 'cookies-next';
import { useRouter } from 'next/router';
import React, { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client';
import stylesLayout from '../../styles/GeneralLayout.module.scss'
import Header from "./Header";

type LayoutProps={
	children: React.ReactNode,
	displayHeader: boolean,
}

interface GlobalData {
	nickname: string;
	socket: Socket;
	gameSocket?: Socket;
}

const SocialENDPOINT="http://localhost:8100";

export const GlobalDataContext=createContext<GlobalData|null>(null);

const Layout=({ children, displayHeader }: LayoutProps) => {
	const [globalData, setGlobalData] = useState<GlobalData|null>(null);
	const [display, setDisplay] = useState<boolean>(false);
	const router = useRouter();
	const componentLoaded = useRef(false);

	useEffect(() => {

		async function fetchNickname() {
			const response = await fetch("http://localhost:3000"+'/users/me/nickname', {
				headers: {
					'Authorization': `Bearer ${getCookie('token')}`
				}
			})

			if (response.status === 401) {
				throw 401;
			}
			return (await response.json());
		}

		if (!componentLoaded.current && !globalData && displayHeader) {
			fetchNickname()
				.then((resolve) => {
					if (resolve.statusCode===404) {
						router.push("/login")
					}
					setGlobalData({
						nickname: resolve.nickname,
						socket: io(SocialENDPOINT, {
							reconnection: false,
							query: { nickname: resolve.nickname },
						})
					})
				})
				.catch(() => {
					router.push("/login");
				})
			componentLoaded.current=true;
			setDisplay(true);
		}
        // eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	if (display || !displayHeader) {
		return (
			<div className={stylesLayout.mainContainer}>
				{globalData && <GlobalDataContext.Provider value={globalData}>
					<Header display={displayHeader} />
					<div className={stylesLayout.childrenContainer}>
						{children}
					</div>
				</GlobalDataContext.Provider>}
			</div>
		);
	}
	else
		return (<></>);
}

export default Layout;