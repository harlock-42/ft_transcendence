import { AchievementBoxInfo } from "../../../lib/IProfile";
import AchievementBox from "./AchivementBox";
import cmpStyle from "../../../../../styles/NewProfile/profile.module.scss";

type Props = {
    achsInfos: AchievementBoxInfo[] | undefined;
    loadAllAchievements: () => void;
}

const ArchivePreview = ({achsInfos, loadAllAchievements}: Props) => {
    return (
        <div className={cmpStyle.previewCnt}>
            <h3 className={cmpStyle.titlePreviewCmt}>Achievements</h3>
            <div className={cmpStyle.previewElementCnt}>
                {achsInfos !== undefined && achsInfos.length > 0 && achsInfos.map((achInfos: AchievementBoxInfo, index: number) => {
                    return (
                        <AchievementBox {...{achInfos}} key={index}/>
                    )
                })}
            </div>
            <a className={cmpStyle.previewMoreBtn}
                onClick={loadAllAchievements}
            >More</a>
        </div>
    )
}

export default ArchivePreview;