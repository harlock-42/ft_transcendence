import Image from "next/image";
import { AchievementBoxInfo } from "../../../lib/IProfile";
import cmpStyle from "../../../../../styles/NewProfile/profile.module.scss";

type Props = {
    achInfos: AchievementBoxInfo;
}

const AchievementBox = ({achInfos}: Props) => {
    return (
        <div className={cmpStyle.achCnt + " " + (achInfos.acquired ? cmpStyle.achCntActive : "")}>
            <div className={cmpStyle.achImgCnt}>
                <Image
                    src={"/achievement/" + achInfos.achievement.imgUrl}
                    alt="Account"
                    layout="responsive"
                    width={"10px"}
                    height={"10px"}
                    objectFit="contain"
                />
            </div>
            <div className={cmpStyle.achInfos}>
                <h3>{achInfos.achievement.name}</h3>
                <p>{achInfos.achievement.text}</p>
            </div>
        </div>
    )
}

export default AchievementBox;