import {MatchInfo, UserInfo} from "../../../lib/IProfile";
import MatchBox from "./MatchBox";
import cmpStyle from "../../../../../styles/NewProfile/profile.module.scss";

type Props = {
	userInfo: UserInfo | null,
	matches: MatchInfo[] | undefined,
	loadAllMatches: () => void,
}

const MatchesPreview = ({userInfo, matches, loadAllMatches}: Props) => {
	return (
		<div className={cmpStyle.previewCnt}>
			<h3 className={cmpStyle.titlePreviewCmt}>Matches</h3>
			<div className={cmpStyle.previewElementCnt}>
				{matches !== undefined && matches.length > 0 && matches.map((match: MatchInfo, index: number) => {
					return (
						<MatchBox {...{userInfo, match}} key={index}/>
					)
				})}
				{(matches == undefined || matches.length <= 0) &&
					<a className={cmpStyle.noMatches}>No match history</a>}
			</div>
			{matches !== undefined &&
				<a className={cmpStyle.previewMoreBtn + " " + (matches.length == 5 ? cmpStyle.Active : cmpStyle.Inactive)}
				   onClick={loadAllMatches}
				>
					More</a>
			}
		</div>
	)
}

export default MatchesPreview;