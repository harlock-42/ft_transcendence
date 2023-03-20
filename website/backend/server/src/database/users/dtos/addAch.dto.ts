import { Transform } from "class-transformer";
import { toNumber } from "src/utils/cast.helper";
import { User } from "../entities/users.entity";

export class AddAchDto
{
  @Transform(({ value }) => toNumber(value))
  id: number;
  name: string;
  text: string;
  users: User[];
}