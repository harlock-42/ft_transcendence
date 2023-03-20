import Image from "next/image";
import {MatchInfo, UserInfo} from "../../../lib/IProfile";
import cmpStyle from "../../../../../styles/NewProfile/profile.module.scss";
import WinImg from "../../../../../public/utils/noun-win-4485498.svg";
import LooseImg from "../../../../../public/utils/noun-defeat-5039719.svg";

type Props = {
	userInfo: UserInfo | null,
	match: MatchInfo,
}

const MatchBox = ({userInfo, match}: Props) => {

	const imgMatch = () => {
		return (
			<div className={cmpStyle.matchImgCnt}>
				<Image
					src={match.isWinner ? WinImg : LooseImg}
					alt="Account"
					layout="responsive"
					width={"10px"}
					height={"10px"}
					objectFit="contain"
				/>
			</div>
		)
	}


	return (
		<div className={cmpStyle.matchBoxCnt}>
			<div
				id={cmpStyle.MatchBoxNameLeft}
				className={cmpStyle.matchBoxPlayer + " " + (match.isWinner ? cmpStyle.matchBoxNameWin : cmpStyle.matchBoxNameLoose)}
			>
				<a>{(userInfo?.myNickname == userInfo?.nickname ? "you" : userInfo?.nickname)}</a>
				{match.isWinner && imgMatch()}
			</div>


			<div
				id={cmpStyle.MatchBoxNameRight}
				className={cmpStyle.matchBoxPlayer + " " + (!match.isWinner ? cmpStyle.matchBoxNameWin : cmpStyle.matchBoxNameLoose)}
			>
				{!match.isWinner && imgMatch()}
				<a>{match.opponent.nickname}</a>
			</div>
		</div>
	)
}

export default MatchBox;