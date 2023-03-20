import { APhysicalBody } from "../Abstact and Interface Classes/APhysicalBody";
import { IActor } from "../Abstact and Interface Classes/IActor";
import { Vector } from "vector2d";
import { MathEx } from "../Utils/MathEx";
import { CollisionDirection } from "../PhysicsResolver";
import { Field } from "./Field";
import { PadAlignment } from "../Utils/Enums";

export class Pad extends APhysicalBody implements IActor
{
  get score (): number
  {
    return this._score;
  }

  set score (value: number)
  {
    this._score = value;
  }

  protected startPos: Vector;
  private _score: number;
  private _alignment: PadAlignment;
  private readonly dampeningThreshold = 0.01; //0.01
  private readonly dampeningFactor = 0.05; //0.05
  public nickName: string;

  get alignment (): PadAlignment
  {
    return this._alignment;
  }

  set alignment (value: PadAlignment)
  {
    this._alignment = value;
  }

  constructor (pos: Vector, width: number, height: number, nickName: string)
  {
    super(pos, width, height);
    this.nickName = nickName;
    this.maxVel = new Vector(0, 6);
    this.startPos = new Vector(pos.x, pos.y);
    this.score = 0;
  }

  public act ()
  {
    if (this.maxVel !== null)
      this.vel.y = MathEx.clamp(this.vel.y, -this.maxVel.y, this.maxVel.y);

    if (Math.abs(MathEx.round(this.vel.y, this.dampeningThreshold)) > this.dampeningThreshold)
      this.vel.y = MathEx.lerp(this.vel.y, 0, this.dampeningFactor);
    else
      this.vel.y = 0;
    this.pos.add(this.vel);
  }

  checkCollisionWith (target: APhysicalBody): CollisionDirection
  {
    if (target instanceof Field)
    {
      if (this.pos.y < target.position.y)
      {
        return CollisionDirection.UP;
      }

      if (this.pos.y + this.height > target.position.y + target.height)
      {
        return CollisionDirection.DOWN;
      }
    }

    return CollisionDirection.NO_COLLISION;
  }

  resolveCollisionWith (target: APhysicalBody, direction: CollisionDirection): void
  {
    if (target instanceof Field)
    {
      if (direction === CollisionDirection.UP)
      {
        this.pos.y += 2;
        this.vel.y *= 0;
      } else if (direction === CollisionDirection.DOWN)
      {
        this.pos.y -= 2;
        this.vel.y *= 0;
      }
    }
  }

  resetPosition ()
  {
    this.pos.setAxes(this.startPos.x, this.startPos.y);
    this.vel.x = 0;
    this.vel.y = 0;
  }

  static calculatePadPosition (canvasWidth: number, canvasHeight: number, align: PadAlignment)
  {
    const padWidth = canvasWidth / 60;
    const padHeight = canvasHeight / 5;
    const position = new Vector(0, 0);

    switch (align)
    {
      case PadAlignment.LEFT:
      {
        position.x = canvasWidth - (canvasWidth - padWidth);
        position.y =
          canvasHeight - (canvasHeight / 2 + padHeight) + padHeight / 2;
        break;
      }
      case PadAlignment.RIGHT:
      {
        position.x = canvasWidth - padWidth * 2;
        position.y =
          canvasHeight - (canvasHeight / 2 + padHeight) + padHeight / 2;
        break;
      }
    }
    return { padWidth, padHeight, position };
  }
}
