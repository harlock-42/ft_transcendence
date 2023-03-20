import React, {MutableRefObject} from "react";
import colors from "../../../styles/colors.module.scss"

export default class GameDisplay {
	public readonly handleResizeBound: () => void;

	private readonly _parentRef!: MutableRefObject<any>;
	private readonly _refCanvas!: MutableRefObject<any>;
	public lastGameData: any;
	private gameFinished: boolean;


	constructor() {
		this._refCanvas = React.createRef();
		this._parentRef = React.createRef();
		this.gameFinished = false;
		this.handleResizeBound = this.updateSizeCanvas.bind(this);
	}

	get refCanvas(): React.MutableRefObject<any> {
		return this._refCanvas;
	}

	get parentRef(): React.MutableRefObject<any> {
		return this._parentRef;
	}

	public updateSizeCanvas() {
		if (this._refCanvas.current == null || this._parentRef.current == null)
			return;
		this._refCanvas.current.width = this._parentRef.current.clientWidth;
		this._refCanvas.current.height = this._parentRef.current.clientHeight;
		const scaleX = this.parentRef.current.clientWidth / 640;
		const scaleY = this.parentRef.current.clientHeight / 480;
		const context = this.refCanvas.current.getContext('2d');
		if (scaleX == context.scale.x && scaleY == context.scale.y)
			return;
		context.scale(scaleX, scaleY);
		if (this.gameFinished && this.lastGameData)
			requestAnimationFrame(() => {
				this.drawEndGame(this.lastGameData);
			});
	}


	public drawGame(gameInfo: any) {
		if (this._refCanvas.current == null || this._parentRef.current == null)
			return;
		this.lastGameData = null;
		this.gameFinished = false;

		const context = this.refCanvas.current.getContext('2d');
		this.resetCanvas(context);
		this.drawPad(gameInfo.players[0], context);
		if (gameInfo.players.length > 0)
			this.drawPad(gameInfo.players[1], context);
		if (gameInfo.obstacles != null)
			for (let i = 0; i < gameInfo.obstacles.length; ++i)
				this.drawObstacles(gameInfo.obstacles[i], context);
		this.drawBall(gameInfo.ball, context);
		this.drawText(context, gameInfo);
	}

	private drawObstacles(obstacle: any, context: CanvasRenderingContext2D) {
		context.beginPath();
		context.fillStyle = colors.darkGray;// 'white'
		context.moveTo(obstacle.vertices[0]._x, obstacle.vertices[0]._y);
		context.lineTo(obstacle.vertices[1]._x, obstacle.vertices[1]._y);
		context.lineTo(obstacle.vertices[2]._x, obstacle.vertices[2]._y);
		context.lineTo(obstacle.vertices[3]._x, obstacle.vertices[3]._y);
		context.fill();
		context.closePath();
	}

	public drawEndGame(endGameInfo: any) {
		if (this._refCanvas.current == null)
			return;
		this.lastGameData = endGameInfo;
		this.gameFinished = true;

		const context = this.refCanvas.current.getContext('2d');
		this.resetCanvas(context);
		this.displayInfoEndGame(context, endGameInfo);
	}


	private resetCanvas(context: CanvasRenderingContext2D) {
		context.clearRect(0, 0, this._refCanvas.current.width, this._refCanvas.current.height);
		this.drawBackground(context);
	}

	private drawBackground(context: CanvasRenderingContext2D) {
		context.beginPath();
		context.setLineDash([0]);
		context.rect(0, 0, 640, 480);
		context.fillStyle = colors.black;  //"black";
		context.fill();
		context.closePath();

		context.beginPath();
		context.setLineDash([10, 15]);
		context.strokeStyle = colors.white;// 'white';
		context.moveTo(640 / 2, 0);
		context.lineTo(640 / 2, 480);
		context.stroke();
		context.closePath();
	}

	private drawBall(ball: any, context: CanvasRenderingContext2D) {
		context.beginPath();
		context.strokeStyle = colors.white;// 'white';
		context.lineWidth = 1;
		context.fillStyle = colors.white;// 'white'
		context.ellipse(ball.pos._x, ball.pos._y, ball.w - 1, ball.h - 1, 0, 0, 2 * Math.PI);
		context.fill();
		context.closePath();
	}

	private drawPad(pad: any, context: CanvasRenderingContext2D) {
		context.beginPath();
		context.setLineDash([0]);
		context.strokeStyle = colors.lightGrey;// 'green';
		context.lineWidth = 2;
		context.fillStyle = colors.white// 'white';
		context.rect(pad.pos._x, pad.pos._y, pad.w - 2, pad.h - 2);
		context.fill();
		context.stroke();
		context.closePath()
	}

	private drawText(context: CanvasRenderingContext2D, gameInfo: any) {
		this.PlayerText(context, gameInfo.players[0]);
		this.PlayerText(context, gameInfo.players[1]);
	}

	private PlayerText(context: CanvasRenderingContext2D, player: any) {
		let offSet = 60;
		let base = 640;
		let side = -1;

		if (player._alignment == 0) // Left Side
		{
			offSet *= -1;
			side = 1;
			base = 0;
		}
		context.beginPath();
		context.font = "40px Roboto Mono";
		context.fillStyle = colors.lightGrey;// "white";
		context.textAlign = "center";
		context.fillText(`${player._score}`, 640 / 2 + offSet, 40);
		context.font = "30px Roboto Mono";
		let textWidth = context.measureText(player.nickName).width;
		context.fillStyle = colors.white;
		context.fillText(`${player.nickName}`, Math.abs(base - offSet + (textWidth / 2 * side)), 480 - 40);
		context.closePath();
	}


	private displayInfoEndGame(context: CanvasRenderingContext2D, dataEndGame: any) {
		context.beginPath();
		context.font = "50px Roboto Mono";
		context.fillStyle = colors.white;// "white";
		context.textAlign = "center";
		let displayText = dataEndGame.winingPlayer.nickName + " has won";
		context.fillText(displayText, 640 / 2, 480 / 2);
		context.closePath();
	}
}