import { APhysicalBody } from "./Abstact and Interface Classes/APhysicalBody";

export enum CollisionDirection
{
  NO_COLLISION,
  LEFT,
  RIGHT,
  UP,
  DOWN,
  CUSTOM,
}

export class PhysicsResolver
{
  private readonly _rigidBodies: APhysicalBody[];

  constructor (entities: APhysicalBody[])
  {
    this._rigidBodies = entities;
  }

  public resolveCollisions (): void
  {
    for (let i = 0; i < this._rigidBodies.length; i++)
    {
      const subject = this._rigidBodies[i];
      for (let j = 0; j < this._rigidBodies.length; j++)
      {
        const target = this._rigidBodies[j];
        if (i != j)
        {
          subject.resolveCollisionWith(target, subject.checkCollisionWith(target));
        }
      }
    }
  }
}
