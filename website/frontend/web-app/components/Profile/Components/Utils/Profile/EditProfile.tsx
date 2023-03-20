import axios, { AxiosResponse } from "axios";
import { getCookie } from "cookies-next";
import { useRouter } from "next/router";
import { ChangeEvent, Dispatch, FormEvent, SetStateAction, useContext, useState } from "react";
import { UserInfo } from "../../../lib/IProfile";
import { EditTFA } from "./EditTFA";
import cmpStyle from "../../../../../styles/NewProfile/profile.module.scss";
import Image from "next/image";
import BackImage from "../../../../../public/utils/noun-back.svg";
import { GlobalDataContext } from "../../../../Utils/Layout";

type Props = {
    userInfo: UserInfo,
    setUserInfo: Dispatch<SetStateAction<UserInfo | null>>,
    loadProfile: (userInfo: UserInfo) => void
}

const EditProfile = ({userInfo, setUserInfo, loadProfile}: Props) => {
    const router = useRouter();
    const [imgPreview, setImgPreview] = useState<string | undefined>(userInfo.image);
   const globalData = useContext(GlobalDataContext)!; 

    async function submitEdit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const file: any = formData.get('file');
        const newNickname: string | undefined = formData.get('newNickname')?.toString();
        let responseImage: AxiosResponse | undefined = undefined;

        if (file !== null && file.size > 0) {
            try {
                responseImage = await axios('http://localhost:3000/users/photo/me', {
                    method: "post",
                    data: formData,
                    headers: {
                        'Authorization': `Bearer ${getCookie('token')}`
                    }
                })
            }
            catch (error: any) {
                switch (error.request.status) {
                    case 400:
                        alert('image: bad format');
                        return;
                    case 401 || 422:
                        router.push('/login')
                        return;
                    case 404:
                        router.push('/404')
                        return;
                }
            }
        }
        if (newNickname !== undefined && newNickname.length > 0) {
            try {
                await axios('http://localhost:3000/users/nickname/me', {
                    method: "post",
                    data: {
                        'nickname': newNickname
                    },
                    headers: {
                        'Authorization': `Bearer ${getCookie('token')}`
                    }
                })
            }
            catch (error: any) {
                switch (error.request.status) {
                    case 418:
                        alert('nickname already exist');
                        return ;
                    case 400:
                        alert('nickname: bad syntax');
                        return;
                    case 401 || 422:
                        router.push('/login')
                        return;
                    case 404:
                        router.push('/404')
                        return;
                }
            }
        }
        setUserInfo((userInfo: UserInfo | null) => {
            if (responseImage) {
                userInfo!.image = 'http://' + process.env.NEXT_PUBLIC_BACKEND_ENDPOINT + '/users/img/' + responseImage.data.imgName;
            }
            if (newNickname !== undefined && newNickname.length > 0) {
                globalData.socket.emit('updateNickname', {oldNickname: userInfo!.nickname, newNickname: newNickname});
                userInfo!.nickname = newNickname;
                userInfo!.myNickname = newNickname;
                router.push('/profile/' + newNickname);
            }
            loadProfile(userInfo!);
            return (userInfo);
        })
    }

    function updatePreview(event: ChangeEvent<HTMLInputElement>) {
        event.target && event.target.files && setImgPreview(URL.createObjectURL(event.target.files[0]));
    }

    return (
        <div className={cmpStyle.AllCnt}>
            <div className={cmpStyle.AllHeaderCnt}>
                <div className={cmpStyle.AllBackBtn}
                    onClick={() => {
                        loadProfile(userInfo);
                    }}
                >
                    <Image
                        src={BackImage}
                        alt="Account"
                        layout="responsive"
                        width="10px"
                        height="10px"
                        objectFit="contain"
                    />
                </div>
                <h1>Edit Profile</h1>
            </div>
            <div className={cmpStyle.editBodyCntr}>
                <div className={cmpStyle.editProfileInfoCntr}>
                    <h2>User Info</h2>
                    <form
                        className={cmpStyle.editFormCntr}
                        onSubmit={submitEdit}
                    >
                        <div className={cmpStyle.editInputCntr}>
                        <label htmlFor="newNickname">Username</label>
                        <input id="newNickname" name="newNickname" type="text"/>
                        </div>
                            <div className={cmpStyle.editInputCntr}>
                            <label htmlFor="profileImg">Profile Image</label>
                            <input id="profileImg" name="file" type="file" onChange={updatePreview}/>
                            </div>
                            <div className={cmpStyle.profileImgCnt}>
                                <Image
                                    src={imgPreview!}
                                    alt={userInfo!.id.toString()}
                                    layout="responsive"
                                    width={"10px"}
                                    height={"10px"}
                                    objectFit="cover"
                                />
                            </div>
                        <button className={cmpStyle.btnSubmitEdit} type="submit">Save Changes</button>
                    </form>
                </div>
                <EditTFA {...{userInfo, setUserInfo}}/>
            </div>
        </div>
    )
}

export default EditProfile;