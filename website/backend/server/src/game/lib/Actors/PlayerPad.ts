import { Pad } from "./Pad";
import { Vector } from "vector2d";
import { PadAlignment } from "../Utils/Enums";
import { GameConfig } from "../config";

export class PlayerPad extends Pad
{
  public socketID: string;
  private readonly moveSpeed: number;
  private readonly moveDir: Vector;
  private mousePosY: number;

  constructor (pos: Vector, width: number, height: number, moveSpeed: number, padAlignment: PadAlignment, nickName: string)
  {
    super(pos, width, height, nickName);
    // this.startPos = new Vector(pos.x, pos.y);
    this.moveSpeed = moveSpeed;
    this.moveDir = new Vector(0, 0);
    this.maxVel = new Vector(0, 5);
    this.mousePosY = GameConfig.width / 2;
    this.alignment = padAlignment;
  }

  public act ()
  {
    this.pos.y = this.mousePosY - this.height / 2;
  }

  public moveUp ()
  {
    this.moveDir.y = -this.moveSpeed;
    this.movePad(this.moveDir);
  }

  public moveDown ()
  {
    this.moveDir.y = this.moveSpeed;
    this.movePad(this.moveDir);
  }

  private movePad (dir: Vector)
  {
    this.vel.add(dir);
  }

  public saveMousePos (mousePosY: number)
  {
    this.mousePosY = mousePosY;
  }

  static createPlayerPad (width: number, height: number, align: PadAlignment = PadAlignment.LEFT, nickName: string): PlayerPad
  {
    const { padWidth, padHeight, position } = Pad.calculatePadPosition(width, height, align);
    return new PlayerPad(position, padWidth, padHeight, 1, align, nickName);
  }
}
