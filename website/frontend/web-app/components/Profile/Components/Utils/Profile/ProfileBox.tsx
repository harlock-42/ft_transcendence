import ProfilePreview from "./ProfilePreview";
import AchivePreview from "../Achivments/AchivePreview";
import MatchesPreview from "../Matches/MatchesPreview";
import {Dispatch, SetStateAction} from "react";
import {UserInfo} from "../../../lib/IProfile";
import cmpStyle from "../../../../../styles/NewProfile/profile.module.scss";

type Props = {
	userInfo: UserInfo | null,
	setUserInfo: Dispatch<SetStateAction<UserInfo | null>>,
	loadEditMode: (userInfo: UserInfo) => void,
	loadAllAchievements: () => void,
	loadAllMatches: () => void
}

const ProfileBox = ({userInfo, setUserInfo, loadEditMode, loadAllAchievements, loadAllMatches}: Props) => {

	return (
		<div className={cmpStyle.profileContainer}>
			{userInfo && <ProfilePreview {...{userInfo, loadEditMode}} />}
			<div className={cmpStyle.profilePrevAchsMatches}>
				<AchivePreview achsInfos={userInfo?.achievementBoxes.slice(0, 3)} {...{loadAllAchievements}}/>
				<MatchesPreview matches={userInfo?.matchs.slice(0, 5)} {...{userInfo, loadAllMatches}}/>
			</div>
		</div>
	)
}

export default ProfileBox;