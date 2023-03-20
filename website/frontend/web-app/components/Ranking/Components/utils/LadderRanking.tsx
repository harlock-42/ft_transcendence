import { RankingInfo } from "../../lib/IRanking";
import { LadderBox } from "./LadderBox";
import cmpStyle from "../../../../styles/ranking/ranking.module.scss";

type Props = {
    rankingArr: RankingInfo[]
}

export const LadderRanking = ({rankingArr}: Props) => {
    return (
        <div className={cmpStyle.ladderCntr}>
            {rankingArr.length > 0 && rankingArr.map((user: RankingInfo, index: number) => {
                const position: string = index + 1 + "/" + rankingArr.length;
                return (
                    <LadderBox {...{user, position}} key={user.nickname}/>
                )
            })}
        </div>
    );
}