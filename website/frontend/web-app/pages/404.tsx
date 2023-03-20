import Layout from '../components/Utils/Layout'
import React from 'react';
import Image from 'next/image';
import cmpStyle from "../styles/NewProfile/profile.module.scss";

function Page404() {
	return (
		<Layout displayHeader={true}>
			<div className={cmpStyle.cnt404}>
				<div className={cmpStyle.cnt404Img}>
					<Image
						alt='pageNotFound'
						src="/utils/404.png"
						layout="responsive"
						width={"100px"}
						height={"100px"}
						objectFit="cover"
					/>
				</div>
			</div>
		</Layout>
	)
}

export default Page404