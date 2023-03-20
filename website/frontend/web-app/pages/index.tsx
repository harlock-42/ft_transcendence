import { NextPage } from "next";
import Layout from "../components/Utils/Layout";
import GameContainer from "../components/Game/components/Container/GameContainer";

const Game: NextPage = () => {
    return (
        <Layout displayHeader={true}>
            <GameContainer/>
        </Layout>
    );
}

export default Game;