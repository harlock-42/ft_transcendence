import { Vector } from "vector2d";
import { CollisionDirection } from "../PhysicsResolver";

export abstract class APhysicalBody
{
  protected pos: Vector;
  protected vel: Vector;
  public maxVel: Vector;
  protected w: number;
  protected h: number;

  constructor (pos: Vector, width: number, height: number)
  {
    this.pos = pos;
    this.w = width;
    this.h = height;
    this.vel = new Vector(0, 0);
  }

  public abstract resetPosition ();

  public abstract checkCollisionWith (target: APhysicalBody): CollisionDirection;

  public abstract resolveCollisionWith (
    target: APhysicalBody,
    direction: CollisionDirection
  ): void;

  set position (value: Vector)
  {
    this.pos = value;
  }

  get position ()
  {
    return this.pos;
  }

  get velocity ()
  {
    return this.vel;
  }

  set velocity (value: Vector)
  {
    this.vel = value;
  }

  get width ()
  {
    return this.w;
  }

  get height ()
  {
    return this.h;
  }
}
