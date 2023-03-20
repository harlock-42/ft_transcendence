import { Ball } from "./Ball";
import { Pad } from "./Pad";
import { Vector } from "vector2d";
import { PadAlignment } from "../Utils/Enums";
import { MathEx } from "../Utils/MathEx";

export class EnemyPad extends Pad
{
  private readonly ball: Ball;
  private readonly iqLevel = 0.4;

  constructor (pos: Vector, width: number, height: number, ball: Ball, padAlignment: PadAlignment)
  {
    super(pos, width, height, "AI");
    this.alignment = padAlignment;
    this.ball = ball;
  }

  public act (): void
  {
    // Fucking unbeatable AI system.
    this.vel.y += MathEx.random(-this.iqLevel * 2.5, this.iqLevel * 2.5);
    if (this.ball.position.y > this.pos.y + this.height)
    {
      this.vel.y += this.iqLevel;
    }

    if (this.ball.position.y < this.pos.y)
    {
      this.vel.y -= this.iqLevel;
    }

    super.act();
  }
}
