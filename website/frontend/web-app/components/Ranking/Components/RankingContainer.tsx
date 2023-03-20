import axios from "axios";
import { getCookie } from "cookies-next";
import { useRouter } from "next/router"
import { useEffect, useRef, useState } from "react"
import { RankingInfo } from "../lib/IRanking";
import { LadderRanking } from "./utils/LadderRanking";
import { PodiumRanking } from "./utils/PodiumRanking";
import cmpStyle from "../../../styles/ranking/ranking.module.scss";

export const RankingContainer = () => {
    const router = useRouter();
    const rankingArrRef = useRef<RankingInfo[]>([]);
    const [isLoaded, setLoaded] = useState<boolean>(false);

    useEffect(() => {
        if (!router.isReady) {
            return;
        }
        assignRankingData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router.isReady])

    function assignRankingData() {
        axios.get('http://localhost:3000/users/ranking', {
            headers: {
                'Authorization': `Bearer ${getCookie('token')}`
            }
        })
        .then((response) => {
            rankingArrRef.current = response.data;
            setLoaded(true);
        })
        .catch((error) => {
            switch (error.response.status) {
                case 422:
                    router.push('/login');
                    return;
                case 400 || 404:
                    router.push('/404');
                    return;
            }
        })
    }

    return (
        <div className={cmpStyle.rankingCntr}>
            {isLoaded && <>
                <PodiumRanking rankingArr={rankingArrRef.current.slice(0, 3)}/>
                <LadderRanking rankingArr={rankingArrRef.current.slice(3, rankingArrRef.current.length)}/>
            </>}
        </div>
    )
}