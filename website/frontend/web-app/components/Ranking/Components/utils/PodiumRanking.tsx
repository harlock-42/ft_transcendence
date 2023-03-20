import { RankingInfo } from "../../lib/IRanking";
import { PodiumBox } from "./PodiumBox";
import cmpStyle from "../../../../styles/ranking/ranking.module.scss";

type Props = {
    rankingArr: RankingInfo[]
}

export const PodiumRanking = ({rankingArr}: Props) => {
    return (
        <div className={cmpStyle.podiumCntr}>
            {rankingArr.length > 0 && rankingArr.map((user: RankingInfo) => {
                return (
                    <PodiumBox {...{user}} key={user.nickname}/>
                )
            })}
        </div>
    );
}