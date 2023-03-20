import { ChangeEvent, Dispatch, FormEvent, SetStateAction, useContext, useEffect, useState } from 'react';
import styles from '../../../styles/chat/Channels.module.scss'
import { GlobalDataContext } from '../../Utils/Layout';
import { createChannel } from '../lib/chatQuery';
import { RoomTarget, RoomType } from '../lib/chatTypes';
import Image from 'next/image';

export class ChannelForm {
    nickname: string = "";
    channelName: string = "";
    isPublic: boolean = true;
    password?: string;
    topic?: string;
    image?: {
        file: File;
        type: string;
    }
}

type Props = {
    setCurRoom: Dispatch<SetStateAction<RoomTarget | null>>,
    setToggleMenu: Dispatch<SetStateAction<boolean>>
}

export const CreateChannelForm = ({setCurRoom, setToggleMenu}: Props) => {
    const globalData = useContext(GlobalDataContext)!;
    const [formData, setFormData] = useState<ChannelForm>(new ChannelForm());

    useEffect(() => {
        if (!formData.nickname) {
            setFormData({...formData, nickname: globalData.nickname});
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const updateFormCheckbox = (event: ChangeEvent<HTMLInputElement>) => {
        setFormData({...formData, 'isPublic': (event.target.value === 'on') ? false : true});
    }

    const updateFormImage = (event: ChangeEvent<HTMLInputElement>) => {
        event.target && event.target.files &&
        setFormData({
            ...formData, 'image': {
                file: event.target.files[0],
                type: event.target.files[0].type
            }
        })
    }

    const updateFormData = (event: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>) => {
        setFormData({...formData, [event.target.name]: event.target.value});
    }

    const submitForm = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (formData.image && formData.image.file.size > 5*1e6) {
            alert('image: too big');
            return;
        }
        createChannel(globalData.socket, formData);
        setToggleMenu(false);
    }

    return (
        <form
            name="form"
            className={styles.channelForm}
            onSubmit={submitForm}
        >
            <div className={styles.channelFormElem}>
                <label htmlFor="name">Name</label>
                <input
                    name="channelName" type="text" placeholder="Channel name..." autoComplete="off" required
                    onChange={updateFormData}
                />
            </div>

            <div className={styles.channelFormElem}>
                <label htmlFor="password">Password</label>
                <input
                    name="password" type="password" placeholder="Password..."
                    onChange={updateFormData}
                />
            </div>

            <div className={styles.channelFormElem}>
                <label htmlFor="topic">Topic</label>
                <textarea
                    name="topic"
                    onChange={updateFormData}
                />
            </div>

            <div className={styles.channelFormElem}>
                <label htmlFor="isPrivate">Private</label>
                <input
                    name="isPrivate" type="checkbox"
                    onChange={updateFormCheckbox}
                />
            </div>

            <div className={styles.channelFormElem}>
                <input
                    name="file" type="file"
                    onChange={updateFormImage}
                />
                <div className={styles.imageContainerForm}>
                    {formData && formData.image && <Image src={URL.createObjectURL(formData.image.file)} alt="" width="10px" height="10px" layout="responsive" objectFit="cover" />}
                </div>
            </div>

            <button type="submit" className={styles.submit}>Create Channel</button>
        </form>
    );
}