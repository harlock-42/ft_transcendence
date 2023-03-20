import Layout from '../components/Utils/Layout'
import { NextPage } from 'next';
import { RankingContainer } from '../components/Ranking/Components/RankingContainer';

const Ranking: NextPage = () => {
    return (
		<Layout displayHeader={true}>
            <RankingContainer />
		</Layout>
	)
}

export default Ranking;