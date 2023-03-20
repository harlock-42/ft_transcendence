import Layout from '../../../components/Utils/Layout'
import React from 'react';
import { NextPage } from "next"
import ProfileContainer from '../../../components/Profile/Components/ProfileContainer';

const Profile: NextPage=() => {

	return (
		<Layout displayHeader={true}>
			<ProfileContainer />
		</Layout>
	)
}

export default Profile;
