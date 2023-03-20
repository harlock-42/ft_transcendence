import Image from "next/image";
import {UserInfo} from "../../../lib/IProfile";
import cmpStyle from "../../../../../styles/NewProfile/profile.module.scss";
import { useContext, useEffect, useState } from "react";
import { GlobalDataContext } from "../../../../Utils/Layout";


type Props = {
	userInfo: UserInfo | null,
	loadEditMode: (userInfo: UserInfo) => void
}

const ProfilePreview = ({userInfo, loadEditMode}: Props) => {
    const globalData = useContext(GlobalDataContext)!;
    const [status, setStatus] = useState<boolean>(true);

    function CalWinRate(nbWin: number, nbLoose : number) : number {
        const nbTotal = nbWin + nbLoose;
        if (nbTotal == 0)
            return 55;
        return (nbWin/nbTotal) * 100;
    }

    useEffect(() => {
        globalData.socket.emit('getStatus', userInfo!.nickname, (newStatus: boolean) => {
            setStatus(newStatus);
        })
        globalData.socket.on('upStatus', ({target, newStatus}: {target: string, newStatus: boolean}) => {
            if (target === userInfo!.nickname) {
                setStatus(newStatus);
            }
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div className={cmpStyle.profilePreviewContainer}>
            <div className={cmpStyle.profileCnt}>
                <div className={cmpStyle.profileImgCnt + ' ' + (status ? '' : cmpStyle.profileImgCntInactive)}>
                    <Image
                        src={userInfo!.image!}
                        // src={"http://localhost:3000/users/img/" + userInfo?.id}
                        alt={userInfo!.id.toString()}
                        layout="responsive"
                        width={"10px"}
                        height={"10px"}
                        objectFit="cover"
                    />
                </div>
                <h1 className={status ? '' : cmpStyle.profileNickNameInactive}>{userInfo?.nickname}</h1>
                <a className={cmpStyle.EditProfileBtn  + " " + (userInfo?.myNickname == userInfo?.nickname ? cmpStyle.Active : cmpStyle.Inactive) } onClick={()=>loadEditMode(userInfo!)}>edit profile</a>
            </div>
            <div className={cmpStyle.profileRankPreviewCnt}>
                <div className={cmpStyle.profileRankHeaderCnt}>
                    <h4>rank</h4>
                    <h3>{userInfo?.elo}</h3>
                </div>

				<div className={cmpStyle.profileRankBodyCnt}>

					<div className={cmpStyle.profileRankBarCnt}>
						<div className={cmpStyle.profileDefeatsScore}
							 style={{"--w": CalWinRate(userInfo!.nbWin, userInfo!.nbLoose)} as React.CSSProperties}>
							<a className={cmpStyle.scoreLeft}>{userInfo?.nbLoose}</a>
						</div>
						<div className={cmpStyle.scoreBar}
							 style={{"--w": CalWinRate(userInfo!.nbWin, userInfo!.nbLoose)} as React.CSSProperties}>
							<span/>
							<a className={cmpStyle.scoreRight}>{userInfo?.nbWin}</a>
						</div>
					</div>
					<div className={cmpStyle.profileRankFooterCnt}>
						<a>Defeats</a>
						<a>Victories</a>
					</div>
				</div>
			</div>
		</div>
	)
}

export default ProfilePreview;