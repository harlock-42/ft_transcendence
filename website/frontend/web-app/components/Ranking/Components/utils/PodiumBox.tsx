import Image from "next/image"
import { RankingInfo } from "../../lib/IRanking"
import cmpStyle from "../../../../styles/ranking/ranking.module.scss";

type Props = {
    user: RankingInfo
}

export const PodiumBox = ({user}: Props) => {
    return (
        <div className={cmpStyle.podiumCntrBoxProfile}>
            <div className={cmpStyle.podiumCntrImg}>
                <Image
                    src={"http://" + process.env.NEXT_PUBLIC_BACKEND_ENDPOINT + "/users/img/" + user.imgUrl}
                    alt="Account"
                    layout="responsive"
                    width={"10px"}
                    height={"10px"}
                    objectFit="cover"
                />
            </div>
            <a className={cmpStyle.nickName}>{user.nickname} </a>
            <a className={cmpStyle.elo}>{user.elo}</a>
        </div>
    )
}