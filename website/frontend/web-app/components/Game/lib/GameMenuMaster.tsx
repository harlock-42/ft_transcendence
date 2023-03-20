import React, {Dispatch, SetStateAction} from "react";
import GameMenu from "../components/Container/GameMenu";
import FindGameComponent from "../components/Container/FindGameComponent";
import GameInfo from "../components/Container/GameInfo";
import GamePlay from "../components/Container/GamePlay";
import GameSpectate from "../components/Container/GameSpectate";
import GameMap from "../components/Container/GameMap";
import GameCanvas from "../components/Container/GameCanvas";
import GameMaster from "./GameMaster";
import GameFriends from "../components/Container/GameFriends";

export default class GameMenuMaster {
	public setCurElement: Dispatch<SetStateAction<JSX.Element | undefined>>;
	public curElem: JSX.Element | null;
	public prevElem: JSX.Element | null;

	private readonly _gameMaster: GameMaster;

	get GameMaster(): GameMaster {
		return this._gameMaster;
	}

	constructor(setElement: Dispatch<SetStateAction<JSX.Element | undefined>>, nickName: string) {
		this.setCurElement = setElement;
		this.curElem = null;
		this.prevElem = null;
		this._gameMaster = new GameMaster(nickName);
		this._gameMaster.MenuMaster = this;
		if (window.matchMedia("(orientation: portrait)").matches) {
			screen.orientation.lock("landscape").then((r) => {
													  }
			).catch((error) => {
				console.log("This browser does not support orientation lock reason : ", error);
			});
			// alert("For a better experience use your phone in landscape");
		}
	}

	public DisplayGameMenu = () => {
		this.DisplayComponent(<GameMenu MenuMaster={this}/>)
	}

	public DisplayGameInfo = () => {
		this.DisplayComponent(<GameInfo MenuMaster={this}/>)
	}

	public DisplayGamePlay = () => {
		this.DisplayComponent(<GamePlay MenuMaster={this}/>)
	}

	public DisplayGameSpectate = () => {
		this.DisplayComponent(<GameSpectate MenuMaster={this}/>)
	}

	public DisplayGameSinglePlayer = () => {
		this.DisplayComponent(<GameMap title={"Solo"} gameMode={false} MenuMaster={this}/>)
	}

	public DisplayGameMultiplayer = () => {
		this.DisplayComponent(<GameMap title={"Multiplayer"} gameMode={true} MenuMaster={this}/>)
	}

	public DisplayFindingGame = () => {
		this.DisplayComponent(<FindGameComponent MenuMaster={this}/>)
	}

	public DisplayGameCanvas = () => {
		this.DisplayComponent(<GameCanvas MenuMaster={this}/>)
	}

	public DisplayGameFriend = () => {
		this.DisplayComponent(<GameFriends MenuMaster={this}/>)
	}

	public GoBack = () => {
		this.backToPrev();
	}


	private DisplayComponent = (cmp: JSX.Element) => {
		if (this.curElem?.type == cmp.type)
			return;
		if (this.curElem)
			this.prevElem = this.curElem;
		this.curElem = cmp;
		this.setCurElement(this.curElem);
	}


	private backToPrev = () => {
		this.curElem = this.prevElem;
		if (this.curElem) {
			this.setCurElement(this.curElem);
		}
	}
}