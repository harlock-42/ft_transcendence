import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User as UserEntity } from "../entities/users.entity";

@Injectable()
export class UserGuardService
{
  constructor (
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>
  )
  {
  }

  async isNickNotInUse (nick: string)
  {
    const user = await this.userRepository.findOne({
      where: { nickname: nick }
    });
    if (user === null)
      return true;
    else
      return false;
  }
}