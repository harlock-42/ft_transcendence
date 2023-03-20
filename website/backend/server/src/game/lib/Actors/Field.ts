import { APhysicalBody } from "../Abstact and Interface Classes/APhysicalBody";
import { CollisionDirection } from "../PhysicsResolver";

export class Field extends APhysicalBody
{
  checkCollisionWith (target: APhysicalBody): CollisionDirection
  {
    return CollisionDirection.NO_COLLISION;
  }

  resolveCollisionWith (target: APhysicalBody, direction: CollisionDirection): void
  {
  }

  resetPosition ()
  {
  };
}
