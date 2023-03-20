import { Transform } from "class-transformer";
import { toBoolean } from "src/utils/cast.helper";

export class RelationsUserDto
{
  // @Transform(({value}) => {toBoolean(value)})
  relations: string[];
}