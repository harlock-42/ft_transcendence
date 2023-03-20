import { APhysicalBody } from "../Abstact and Interface Classes/APhysicalBody";
import { IActor } from "../Abstact and Interface Classes/IActor";
import { Vector } from "vector2d";
import { CollisionDirection } from "../PhysicsResolver";
import { Field } from "./Field";
import { Pad } from "./Pad";
import { TypedEventEmitter } from "../Utils/CustomEventEmitter";
import { ScoreActionEvent } from "../Utils/Enums";
import { GameConfig } from "../config";
import { Obstacles } from "./Obstacles";
import { Logger } from "@nestjs/common";
import { MathEx } from "../Utils/MathEx";

export class Ball extends APhysicalBody implements IActor
{
  private readonly scoreEventEmitter: TypedEventEmitter<ScoreActionEvent>;
  private normalLineOfCollision: Vector;
  private dstFromPadCenter: number;
  private padWidth: number;
  public logger: Logger = new Logger("Ball ");
  public dirStart = 1.5;

  constructor (
    pos: Vector,
    width: number,
    height: number,
    scoreEmitter: TypedEventEmitter<ScoreActionEvent>
  )
  {
    super(pos, width, height);
    this.velocity.setAxes(
      this.dirStart,
      MathEx.random(-1.25, 1.25)
    );
    this.scoreEventEmitter = scoreEmitter;
    this.maxVel = new Vector(4, 4);
  }

  public act ()
  {
    if (this.maxVel !== null)
    {
      this.vel.x = MathEx.clamp(this.vel.x, -this.maxVel.x, this.maxVel.x);
      this.vel.y = MathEx.clamp(this.vel.y, -this.maxVel.y, this.maxVel.y);
    }
    this.pos.add(this.vel);
  }

  public resetPosition ()
  {
    this.pos.x = GameConfig.width / 2;
    this.pos.y = GameConfig.height / 2;
    this.dirStart *= -1;
    const velStart = new Vector(
      this.dirStart,
      MathEx.random(-1.25, 1.25)
    );
    this.velocity.setAxes(velStart.x, velStart.y);
    // this.velocity.setAxes(1.5, 2);
  }

  public checkCollisionWith (target: APhysicalBody): CollisionDirection
  {
    if (target instanceof Field)
    {
      return this.checkCollisionWithField(target);
    } else if (target instanceof Pad)
    {
      return this.checkCollisionWithPad(target);
    } else if (target instanceof Obstacles)
      return this.checkCollisionWithObstacle(target);
    return CollisionDirection.NO_COLLISION;
  }

  private checkCollisionWithField (target: Field): CollisionDirection
  {
    if (this.pos.x - this.width < target.position.x)
    {
      this.scoreEventEmitter.emit(ScoreActionEvent.RIGHT_PLAYER_SCORED);
      return CollisionDirection.LEFT;
    } else if (this.pos.x + this.width > target.position.x + target.width)
    {
      this.scoreEventEmitter.emit(ScoreActionEvent.LEFT_PLAYER_SCORED);
      return CollisionDirection.RIGHT;
    } else if (this.pos.y - this.height < target.position.y)
      return CollisionDirection.UP;
    else if (this.pos.y + this.height > target.position.y + target.height)
      return CollisionDirection.DOWN;
  }

  private checkCollisionWithPad (target: Pad): CollisionDirection
  {
    if (
      this.pos.y > target.position.y &&
      this.pos.y < target.position.y + target.height
    )
    {
      ///Left Side pad collision
      if (
        this.pos.x > target.position.x + target.width &&
        this.pos.x - this.width < target.position.x + target.width
      )
      {
        this.padWidth = target.height;
        this.dstFromPadCenter =
          this.pos.y - (target.position.y + target.height / 2);
        return CollisionDirection.LEFT;
      }
      /// Right side pad collision
      if (
        this.pos.x < target.position.x &&
        this.pos.x + this.width > target.position.x
      )
      {
        this.padWidth = target.height;
        this.dstFromPadCenter =
          target.position.y + target.height / 2 - this.pos.y;
        return CollisionDirection.RIGHT;
      }
    }
    return CollisionDirection.NO_COLLISION;
  }

  private checkCollisionWithObstacle (target: Obstacles)
  {
    const { Collision, normalLine } = target.checkCollisionWithBall(this);
    if (!Collision)
    {
      // this.logger.log('No collision happen');
      return CollisionDirection.NO_COLLISION;
    }
    this.normalLineOfCollision = normalLine;
    // this.normalLineOfCollision = this.normalLineOfCollision.normalise();
    return CollisionDirection.CUSTOM;
  }

  public resolveCollisionWith (
    target: APhysicalBody,
    direction: CollisionDirection
  ): void
  {
    switch (direction)
    {
      case CollisionDirection.NO_COLLISION:
        break;
      case CollisionDirection.LEFT:
        this.calculateVectorOfCollisionWithPad(1);
        this.pos.x += 2;
        // this.vel.x = 2;
        // this.vel.y = 0;
        break;
      case CollisionDirection.RIGHT:
        this.calculateVectorOfCollisionWithPad(-1);
        this.pos.x -= 2;
        // this.vel.x = -2;
        // this.vel.y = 0;
        break;
      case CollisionDirection.UP:
        this.pos.y += 1;
        this.vel.y *= -1;
        break;
      case CollisionDirection.DOWN:
        this.pos.y -= 1;
        this.vel.y *= -1;
        break;
      case CollisionDirection.CUSTOM:
        const tmp = this.normalLineOfCollision
          .clone()
          .mulS(this.normalLineOfCollision.dot(this.vel.clone()))
          .mulS(2);
        this.vel = this.vel.subtract(tmp);
        // this.vel.mulS(4);
        this.pos.add(this.normalLineOfCollision);
        break;
    }
  }

  private calculateVectorOfCollisionWithPad (side: number)
  {
    let tmp = new Vector(0, 0);
    const normalPad = new Vector(1, 0);
    normalPad.x *= side;
    let angle = MathEx.map_range(
      this.dstFromPadCenter,
      -this.padWidth / 2,
      this.padWidth / 2,
      -75,
      75
    );
    angle = (angle * Math.PI) / 180;
    tmp.x = normalPad.x * Math.cos(angle) - normalPad.y * Math.sin(angle);
    tmp.y = normalPad.x * Math.sin(angle) + normalPad.y * Math.cos(angle);
    tmp = tmp.normalise();
    tmp.mulS(
      this.vel.clone().magnitude() *
      MathEx.clamp(Math.abs(this.dstFromPadCenter / 2), 0.9, 1.1)
    );
    this.vel = tmp;
  }
}
