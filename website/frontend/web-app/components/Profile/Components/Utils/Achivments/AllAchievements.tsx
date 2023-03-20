import { AchievementBoxInfo, UserInfo } from "../../../lib/IProfile";
import AchievementBox from "./AchivementBox";
import cmpStyle from "../../../../../styles/NewProfile/profile.module.scss";
import Image from "next/image";
import BackImage from "../../../../../public/utils/noun-back.svg";

type Props = {
    userInfo: UserInfo | null,
    loadProfile: (userInfo: UserInfo) => void
}

const AllAchievements = ({userInfo, loadProfile}: Props) => {
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
                <h1>Achievements</h1>
            </div>
            <div className={cmpStyle.AllBoxCnt}>
            {userInfo?.achievementBoxes !== undefined && userInfo?.achievementBoxes.length > 0 && userInfo?.achievementBoxes.map((achInfos: AchievementBoxInfo, index: number) => {
                return (
                    <AchievementBox {...{achInfos}} key={index}/>
                )
            })}
            </div>
        </div>
    )
}

export default AllAchievements;