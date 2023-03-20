import styleHeader from '../../styles/Header.module.scss'
import Image from 'next/image'
import LoginImg from "../../public/utils/Account_Login.svg"
import LogoutImg from "../../public/utils/Account_Logout.svg"
import HeaderImg from "../../public/utils/arrow-01.svg"
import {useContext, useRef} from "react";
import {useRouter} from "next/router";
import {GlobalDataContext} from './Layout'
import {deleteCookie, removeCookies} from "cookies-next";


type HeaderProps = {
	display: boolean,
}

const Header = ({display}: HeaderProps) => {
	const refNavBar = useRef<any>();
	const refIconMenu = useRef<any>();
	const router = useRouter();
	const globalData = useContext(GlobalDataContext)!;


	function Logout() {
		deleteCookie("token");
		globalData.socket.disconnect();
		LoadPage("/login");
	}

	function LoadPage(page: string) {
		if (globalData) {
			globalData.socket.disconnect();
		}
		router.push(page).then();
	}

	function displayNavBar() {
		const nav = refNavBar.current;
		const Icon = refIconMenu.current;
		nav.classList.toggle(styleHeader.headerIsOpen);
		Icon.classList.toggle(styleHeader.displayMenuRotated);
	}

	return (
		<>
			<div ref={refIconMenu} className={styleHeader.displayMenu} onClick={displayNavBar}>
				<Image
					src={HeaderImg}
					alt="Account"
					layout="responsive"
					objectFit="contain"
				/>
			</div>
			<div ref={refNavBar} className={styleHeader.headerContainer}>
				<div className={styleHeader.buttonsContainer}>
					{/*-----------GAME PAGE--------------*/}
					<a
						onClick={() => LoadPage("/")}
						className={router.asPath === "/" ? "" : styleHeader.buttonUnselected}
					>
						Play
					</a>

					{/*-----------Social PAGE--------------*/}
					<a
						onClick={() => LoadPage("/social")}
						className={router.asPath === "/social" ? "" : styleHeader.buttonUnselected}
					>
						Social
					</a>

					{/*-----------Ranking PAGE--------------*/}
					<a
						onClick={() => LoadPage("/ranking")}
						className={router.asPath === "/ranking" ? "" : styleHeader.buttonUnselected}
					>
						Ranking
					</a>

					{/*-----------About PAGE--------------*/}
					<a
						onClick={() => LoadPage("/about")}
						className={router.asPath === "/about" ? "" : styleHeader.buttonUnselected}
					>
						About
					</a>
				</div>
				<div className={styleHeader.imageContainer}
					 onClick={router.asPath.includes("profile/" + globalData.nickname) ? Logout : () => LoadPage("/profile/" + globalData.nickname)}>
					{/*-----------Profile PAGE--------------*/}

					<Image
						src={router.asPath == "/profile/" + globalData.nickname ? LogoutImg : LoginImg}
						alt="Account"
						layout="responsive"
						objectFit="contain"
					/>
				</div>
			</div>
		</>
	);
}
export default Header;