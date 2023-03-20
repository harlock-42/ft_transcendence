import Image from "next/image";
import {MatchInfo, UserInfo} from "../../../lib/IProfile";
import MatchBox from "./MatchBox";
import cmpStyle from "../../../../../styles/NewProfile/profile.module.scss";
import BackImage from "../../../../../public/utils/noun-back.svg";

type Props = {
	userInfo: UserInfo | null,
	loadProfile: (userInfo: UserInfo) => void
}

const AllMatches = ({userInfo, loadProfile}: Props) => {
	return (
		<div className={cmpStyle.AllCnt}>
			<div className={cmpStyle.AllHeaderCnt}>
				<div className={cmpStyle.AllBackBtn}
				>
					<Image
						src={BackImage}
						alt="Account"
						layout="responsive"
						width={"10px"}
						height={"10px"}
						objectFit="contain"
						onClick={() => loadProfile(userInfo!)}
					/>
				</div>
				<h1>Matches</h1>
			</div>
			<div className={cmpStyle.AllBoxMatchesCnt}>
				{userInfo?.matchs !== undefined && userInfo?.matchs.length > 0 && userInfo?.matchs.map((match: MatchInfo, index: number) => {
					return (
						<MatchBox {...{userInfo, match}} key={index}/>
					)
				})}
			</div>
		</div>
	);
}

export default AllMatches;