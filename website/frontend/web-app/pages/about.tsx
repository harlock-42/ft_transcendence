import Layout from '../components/Utils/Layout'
import styles from '../styles/about/about.module.scss'
import Image from 'next/image';

function IndexPage()
{
	return (
		<Layout displayHeader={true}>
			<div className={styles.home_page}>
				<div className={styles.home_container}>
					<div className={styles.home_text_container}>
						<h1>
							PONG.
						</h1>
						<p>
						Pong is a table tennis–themed twitch arcade sports video game,
						featuring simple two-dimensional graphics, manufactured by Atari and originally released in 1972. <br/><br/>
						It was one of the earliest arcade video games; <br/><br/>
						it was created by Allan Alcorn as a training exercise assigned to him
						by Atari co-founder Nolan Bushnell, but Bushnell and Atari co-founder Ted Dabney were surprised
						by the quality of Alcorn&apos;s work and decided to manufacture the game.<br/><br/>
						Bushnell based the game&apos;s concept on an electronic ping-pong game included in the Magnavox Odyssey,
						the first home video game console. <br/><br/>
						In response, Magnavox later sued Atari for patent infringement.
						</p>
					</div>
					<div className={styles.img}>
						<Image alt='pongGame' src={"/about/noun-pong-game.svg"} width={100} height={100} layout="responsive" />
					</div>
				</div>

				<div className={styles.about_us}>
					<h1>ABOUT THE PROJECT</h1>
					<p>
					&quot;Soon, you will realize that you already know things
					that you thought you didn’t. <br/><br/>
					This project is about creating a website for the mighty Pong contest!&quot;
					</p> 
					<p>
						This is the last common core project of school 42.
						The superficial purpose of this project is to implement a real-time online pong contest website.
						We used for this project NestJS, NextJS and postgreSQL.
						The real purpose is to create something you&apos;ve never done before with a language you&apos;ve never used and a framework you&apos;ve never experienced before.
					</p>
				</div>
			</div>
		</Layout>
	)
}

export default IndexPage
