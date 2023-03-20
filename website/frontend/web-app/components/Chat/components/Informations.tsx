import styles from '../../../styles/chat/Messages.module.scss';

export const Informations = () => {
    return (
        <div className={styles.infoContainer}>
            <h1>Chat commands</h1>
            <div className={styles.cmdContainer}>
                <h3>User commands:</h3>
                <ul>
                    <li>/join [channel_name] [password?]</li>
                    <dd>JOIN a channel</dd>

                    <li>/leave [channel_name?]</li>
                    <dd>LEAVE a channel, perform on the current channel if channel_name is empty</dd>
                </ul>

                <h3>Operator commands:</h3>
                <ul>
                    <li>/kick [target_name] [reason?]</li>
                    <dd>KICK target from the current channel</dd>

                    <li>/mute [target_name] [reason?]</li>
                    <dd>MUTE target on the current channel</dd>

                    <li>/timemute [target_name] [time_in_seconds] [reason?]</li>
                    <dd>MUTE target on the current channel for a limited time</dd>

                    <li>/unmute [target_name]</li>
                    <dd>UNMUTE target on the current channel</dd>

                    <li>/ban [target_name] [reason?]</li>
                    <dd>BAN target on the current channel</dd>

                    <li>/timeban [target_name] [time_in_seconds] [reason?]</li>
                    <dd>BAN target on the current channel for a limited time</dd>

                    <li>/unban [target_name]</li>
                    <dd>UNBAN target on the current channel</dd>

                    <li>/invite [target_name]</li>
                    <dd>INVITE target in the current channel</dd>

                    <li>/invitelist</li>
                    <dd>get users currently invited</dd>

                    <li>/set &apos;public&apos; | &apos;private&apos;</li>
                    <dd>SET privacy settings on the current channel</dd>

                    <li>/set &apos;topic&apos; [new_topic?]</li>
                    <dd>SET topic on the current channel, delete topic if new topic is empty</dd>
                </ul>

                <h3>Founder commands:</h3>
                <ul>
                    <li>/op [target_name]</li>
                    <dd>grant OPERATOR privileges to target on the current channel</dd>

                    <li>/deop [target_name]</li>
                    <dd>remove OPERATOR privileges to target on the current channel</dd>

                    <li>/set &apos;password&apos; [new_password?]</li>
                    <dd>SET password on the current channel, delete password if new password is empty</dd>
                </ul>
            </div>
        </div>
    )
}