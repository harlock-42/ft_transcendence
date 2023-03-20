import { APhysicalBody } from "../Abstact and Interface Classes/APhysicalBody";
import { CollisionDirection } from "../PhysicsResolver";
import { Vector } from "vector2d";
import { Ball } from "./Ball";

export class Obstacles extends APhysicalBody
{

  private readonly vertices: Vector[];
  private center: Vector;

  constructor (pos: Vector, width: number, height: number, angle: number)
  {
    super(pos, width, height);
    this.vertices = [];
    this.pos.x -= width / 2;
    this.pos.y -= height / 2;

    //LeftTopCorner
    this.vertices[0] = pos;
    //RightTopCorner
    this.vertices[1] = new Vector(pos.x + width, pos.y);
    //RightBottomCorner
    this.vertices[2] = new Vector(pos.x + width, pos.y + height);
    //LeftBottomCorner
    this.vertices[3] = new Vector(pos.x, pos.y + height);
    this.center = new Vector(pos.x + width / 2, pos.y + height / 2);
    this.vertices[0] = this.rotateVertices(this.vertices[0], angle);
    this.vertices[1] = this.rotateVertices(this.vertices[1], angle);
    this.vertices[2] = this.rotateVertices(this.vertices[2], angle);
    this.vertices[3] = this.rotateVertices(this.vertices[3], angle);
  }

  private rotateVertices (vertices: Vector, angleInDegrees: number): Vector
  {
    const angleInRadians = (angleInDegrees * Math.PI) / 180;
    const tmp = new Vector(0, 0);
    tmp.x = (vertices.x - this.center.x) * Math.cos(angleInRadians) -
      (vertices.y - this.center.y) * Math.sin(angleInRadians) + this.center.x;
    tmp.y = (vertices.x - this.center.x) * Math.sin(angleInRadians) +
      (vertices.y - this.center.y) * Math.cos(angleInRadians) + this.center.y;

    return tmp;
  }

  checkCollisionWith (target: APhysicalBody): CollisionDirection
  {
    return CollisionDirection.NO_COLLISION;
  }

  resetPosition ()
  {
  }

  resolveCollisionWith (
    target: APhysicalBody,
    direction: CollisionDirection
  ): void
  {
  }

  public checkCollisionWithBall (target: Ball)
  {
    let vCur;
    let vNext;
    let Collision;
    let normalLine = new Vector(0, 0);

    for (let i = 0; i < this.vertices.length; ++i)
    {
      vCur = i;
      vNext = i + 1;
      if (vNext == this.vertices.length)
        vNext = 0;
      Collision = this.checkLineCircle(target.position.clone().add(target.velocity), target.width, this.vertices[vCur], this.vertices[vNext]);
      if (Collision)
        break;
    }

    // if (!Collision)
    // {
    //   const centerInside = this.polygonPoint(this.vertices, target.position);
    //   if (centerInside)
    //     Collision = true;
    // }
    if (Collision)
    {
      // if (vCur % 2 == 0)
      normalLine = this.calculateNormalOfSegmentClockWise(this.vertices[vCur], this.vertices[vNext]);
      // else
      //   normalLine = this.calculateNormalOfSegmentCounterClockWise(this.vertices[vCur], this.vertices[vNext]);
      // let tmp = this.vertices[vCur].clone();
      // let tmp2 = this.vertices[vNext].clone();
      // let tmp3 = (tmp2.subtract(tmp)).normalise();
      // if (Math.acos((tmp3.dot(target.velocity)) / (target.velocity.magnitude() * tmp3.magnitude())) < 0.1) {
      //   Collision = false;
      //   target.velocity.rotate(1.5708);
      // }

      // const centerInside = this.polygonPoint(this.vertices, target.position);
      // if (centerInside)
      //   Collision = false;
    }
    // const centerInside = this.polygonPoint(this.vertices, target.position);
    // if (centerInside)
    return { Collision, normalLine };
  }

  checkLineCircle (circle, radius, p1, p2): boolean
  {
    let v1 = new Vector(0, 0);
    let v2 = new Vector(0, 0);
    let v3 = new Vector(0, 0);
    let u;
    // get dist to end of line
    v2.x = circle.x - p1.x;
    v2.y = circle.y - p1.y;
    // check if end points are inside the circle
    if (Math.min(Math.hypot(p2.x - circle.x, p2.y - circle.y), Math.hypot(v2.x, v2.y)) <= radius)
    {
      return true;
    }
    // get the line as a vector
    v1.x = p2.x - p1.x;
    v1.y = p2.y - p1.y;
    // get the unit distance of the closest point on the line
    u = (v2.x * v1.x + v2.y * v1.y) / (v1.y * v1.y + v1.x * v1.x);
    // is this on the line segment
    if (u >= 0 && u <= 1)
    {
      v3.x = v1.x * u; // get the point on the line segment
      v3.y = v1.y * u;
      // get the distance to that point and return true or false depending on the
      // it being inside the circle
      return (Math.hypot(v3.y - v2.y, v3.x - v2.x) <= radius);
    }
    return false; // no intercept
  }

  calculateNormalOfSegmentClockWise (v1: Vector, v2: Vector): Vector
  {
    const line = v2.clone().subtract(v1.clone()).normalise();
    return new Vector(line.y, -line.x);
  }

  calculateNormalOfSegmentCounterClockWise (v1: Vector, v2: Vector): Vector
  {
    const line = v2.clone().subtract(v1.clone()).normalise();
    return new Vector(-line.y, line.x);
  }

  lineCircle (v1: Vector, v2: Vector, ball: Ball): boolean
  {
    const inside1 = this.pointCircle(v1, ball);
    const inside2 = this.pointCircle(v2, ball);

    if (inside1 || inside2) return true;

    let dstX = v1.x - v2.x;
    let dstY = v1.y - v2.y;
    const len = Math.sqrt(dstX * dstX + dstY * dstY);

    const dot = (((ball.position.x - v1.x) * (v2.x - v1.x)) + ((ball.position.y - v1.y) * (v2.y - v1.y))) / Math.pow(len, 2);

    const closestX = v1.x + (dot * (v2.x - v1.x));
    const closestY = v1.y + (dot * (v2.y - v1.y));

    const onSegment = this.linePoint(v1, v2, new Vector(closestX, closestY));
    if (!onSegment) return false;

    dstX = closestX - ball.position.x;
    dstY = closestY - ball.position.y;
    const dst = Math.sqrt((dstX * dstX) + (dstY * dstY));

    return dst <= ball.width;
  }

  pointCircle (p: Vector, ball: Ball): boolean
  {
    const dstX = p.x - ball.position.x;
    const dstY = p.y - ball.position.y;
    const dst = Math.sqrt(dstX * dstX + dstY * dstY);

    return dst <= ball.width + ball.velocity.magnitude() / 2;
  }

  linePoint (v1: Vector, v2: Vector, point: Vector): boolean
  {
    const errorMargin = 0.01;

    const d1 = point.distance(v1);
    const d2 = point.distance(v2);

    const lenLine = v1.distance(v2);

    return d1 + d2 >= lenLine - errorMargin && d1 + d2 <= lenLine + errorMargin;
  }

  polygonPoint (vertices: Vector[], point)
  {
    let collision = false;

    // go through each of the vertices, plus the next
    // vertex in the list
    let next = 0;
    let current = 0;
    for (current = 0; current < vertices.length; current++)
    {
      next = current + 1;
      if (next == vertices.length) next = 0;

      const vc = vertices[current]; // c for "current"
      const vn = vertices[next]; // n for "next"

      if (((vc.y > point.y && vn.y < point.y) || (vc.y < point.y && vn.y > point.y)) &&
        (point.x < (vn.x - vc.x) * (point.y - vc.y) / (vn.y - vc.y) + vc.x))
      {
        collision = !collision;
      }
    }
    return { collision, current, next };
  }
}
