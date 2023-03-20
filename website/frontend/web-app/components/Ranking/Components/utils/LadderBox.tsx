import { RankingInfo } from "../../lib/IRanking"
import Image from "next/image"
import cmpStyle from "../../../../styles/ranking/ranking.module.scss";

type Props = {
    user: RankingInfo,
    position: string
}

export const LadderBox = ({user, position}: Props) => {
    return (
        <div className={cmpStyle.ladderBoxCntr}>
            <div className={cmpStyle.ladderUserCntr}>
                <div className={cmpStyle.ladderImgCntr}>
                    <Image
                        src={"http://" + process.env.NEXT_PUBLIC_BACKEND_ENDPOINT + "/users/img/" + user.imgUrl}
                        alt="Account"
                        layout="responsive"
                        width={"10px"}
                        height={"10px"}
                        objectFit="cover"
                    />
                </div>
                <a>{user.nickname}</a>
            </div>
            <a className={cmpStyle.infoRank}>{position} </a>
            <a className={cmpStyle.infoRank}>{user.elo}</a>
        </div>
    )
}