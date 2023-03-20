import { Ball } from "../lib/Actors/Ball";
import { Pad } from "../lib/Actors/Pad";
import { Obstacles } from "../lib/Actors/Obstacles";
import { GameConfig } from "../lib/config";

export class InfoGameDto
{
  ball: Ball;
  players: Pad[];
  maxScore: number;
  obstacles: Obstacles[];
  gameConfig: GameConfig;
}

export class InfoEndGameDto
{
  winingPlayer: Pad;
  losingPlayer: Pad;
}
