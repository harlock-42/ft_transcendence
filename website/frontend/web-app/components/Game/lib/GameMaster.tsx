import React, {MutableRefObject} from "react";
import socketIOClient, {io, Socket} from "socket.io-client";
import GameDisplay from "./GameDisplay";
import GameMenuMaster from "./GameMenuMaster";
import GameSpectate from "../components/Container/GameSpectate";
import GameFriends from "../components/Container/GameFriends";
import FindGameComponent from "../components/Container/FindGameComponent";
const Game_ENDPOINT = "http://127.0.0.1:8080";

export interface FriendGameInfo {
    mapMode: boolean;
    playMode: boolean;
    sender: string;
    target: string;
    roomID: number;
    date: Date;
}

export interface GamesInfo {
    roomID: number;
    Player1NickName: string;
    Player2NickName: string;
}

class GamesQueryInfo
{
    mapMode: boolean = false;
    playMode: boolean = false;
    nickName?: string | null = "TMP";
}

export default class GameMaster {

    public NickName?: string | null;
    public Spectator?: boolean;
    public DisplayGamesInfos!: any;
    public MenuMaster?: GameMenuMaster;

    private readonly _socketRef: MutableRefObject<Socket | null>;
    private _gameDisplay: GameDisplay;
    private _indexGame!: number;
    private timeOutDisplayGameMenu: NodeJS.Timeout | null = null;

    private readonly handleInputBound: (e: TouchEvent | MouseEvent) => void;

    get socketRef(): React.MutableRefObject<any> {
        return this._socketRef;
    }

    get GameDisplay() : GameDisplay {
        return this._gameDisplay;
    }

    constructor(nickName: string | null) {
        this._socketRef = React.createRef();
        this._gameDisplay = new GameDisplay();
        this.handleInputBound = this.handleWindowsMouseMove.bind(this);
        this.init(nickName);
    }

    private init(nickName: string | null) {
        this.Spectator = true;
        this.NickName = nickName;
        this._gameDisplay = new GameDisplay();
        this.initSocket();
    }

    private initSocket()
    {
        this._socketRef.current = io(Game_ENDPOINT, { reconnection: false })

        this._socketRef.current?.on('startingFrame', (data: any) => {
            this.MenuMaster?.DisplayGameCanvas();
        });

        this._socketRef.current?.on('newFrame', (data: any) => {
            window.requestAnimationFrame(() => {
                this._gameDisplay.drawGame(data)
            });
        });

        this._socketRef.current?.on('endGame', (data: any) => {
            window.requestAnimationFrame(() => {
                this._gameDisplay.drawEndGame(data);
            });
            this.timeOutDisplayGameMenu = setTimeout(this.QuitGame.bind(this), 5000)
            // this.spectator = true;
        });

        this._socketRef.current?.on('RoomID', (data: number) => {
            this._indexGame = data;
        });

        this._socketRef.current?.on('AllGames', (data: GamesInfo[]) =>
        {
            if (!(this.MenuMaster?.curElem?.type == GameSpectate))
                return;
            this.DisplayGamesInfos(data);
        });

        this._socketRef.current?.on('AllChallengesGame', (data: FriendGameInfo[]) =>
        {
            if (!(this.MenuMaster?.curElem?.type == GameFriends))
                return;
            this.DisplayGamesInfos(data);
        });

        this._socketRef.current?.on('RequestCanceled', () => {
            if (!(this.MenuMaster?.curElem?.type == FindGameComponent))
                return;
            this.MenuMaster.DisplayGamePlay();
        })
    }


    public AddEventListeners()
    {
        window.addEventListener('resize', this._gameDisplay.handleResizeBound);
        const isMobile : boolean = window.matchMedia("(pointer:coarse)").matches;
        if (this.Spectator)
            return
        if (!isMobile)
            window.addEventListener('mousemove', this.handleInputBound);
        else
            window.addEventListener('touchmove', this.handleInputBound);
    }

    public RemoveEventListeners()
    {
        window.removeEventListener('resize', this._gameDisplay.handleResizeBound);
        const isMobile : boolean = window.matchMedia("(pointer:coarse)").matches;
        if (!isMobile)
            window.removeEventListener('mousemove', this.handleInputBound);
        else
            window.removeEventListener('touchmove', this.handleInputBound);
    }

    public connectAsSpectToGame(id: number)
    {
        this._socketRef.current?.emit('connectSpecToGame', id);
        this.Spectator = true;
        this.MenuMaster?.DisplayGameCanvas();
    }

    public connectToChallengeRequest(gameInfo: any)
    {
        this.Spectator = false;
        this._socketRef.current?.emit('handleChallengeConnection', {infoRoom: gameInfo, clientNickName: this.NickName});
        this.MenuMaster?.DisplayFindingGame();
    }


    public ConnectToGame(mapMode: boolean, playMode:boolean)
    {
        const gameQuery = new GamesQueryInfo();
        gameQuery.nickName = this.NickName;
        gameQuery.mapMode = mapMode;
        gameQuery.playMode = playMode;
        this.Spectator = false;
        this.socketRef.current.emit('playerConnectToGame', gameQuery);
        this.MenuMaster?.DisplayFindingGame();
    }

    public QuitGame()
    {
        this.RemoveEventListeners();
        if (this.Spectator)
            this.socketRef.current.emit('disconnectSpecFromGame');
        else {
            this.socketRef.current.emit('disconnectFromGame');
        }
        this.Spectator = true;
        this.GameDisplay.lastGameData = null;
        if (this.timeOutDisplayGameMenu != null)
        {
            clearTimeout(this.timeOutDisplayGameMenu);
            this.timeOutDisplayGameMenu = null;
        }
        this.MenuMaster?.DisplayGamePlay();
    }



    public DisconnectFromGameServices()
    {
        this._socketRef.current?.emit("disconnectFromGame");
    }

    private static remap(value: number, from1: number, to1: number, from2: number, to2: number): number {
        return (value - from1) / (to1 - from1) * (to2 - from2) + from2;
    }

    private handleWindowsMouseMove(e: TouchEvent | MouseEvent) {
        if (this._indexGame == undefined || this.Spectator)
            return;
        const isMobile : boolean = window.matchMedia("(pointer:coarse)").matches;
        // @ts-ignore
        let clientPos: number = isMobile ? e.touches[0].clientY : e.clientY;
        const rectCanvas = this._gameDisplay.refCanvas.current.getBoundingClientRect();
        if (clientPos > rectCanvas.bottom || clientPos < rectCanvas.top)
            return;
        let mousePosY = clientPos - rectCanvas.top;
        let posY = GameMaster.remap(mousePosY, 0, rectCanvas.height, 0, 480);
        let index = this._indexGame;
        this._socketRef.current?.emit('clientInput', {index: index, posY: posY});
    }
}