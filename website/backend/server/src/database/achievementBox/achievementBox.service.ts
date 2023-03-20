import { Injectable, UnprocessableEntityException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../users/entities/users.entity";
import { AchievementBox } from "./achievementBox.entity";

@Injectable()
export class AchievementBoxService
{
  constructor (
    @InjectRepository(AchievementBox)
    private achBoxRepository: Repository<AchievementBox>
  )
  {
  }

  async findAll (): Promise<AchievementBox[] | void>
  {
    return this.achBoxRepository.find()
      .then((resolve) =>
      {
        return resolve;
      })
      .catch((resolve) =>
      {
        throw new UnprocessableEntityException();
      });
  }

  async findByUser (user: User): Promise<AchievementBox[]>
  {
    return this.achBoxRepository.find({
        where: {
          user: {
            id: user.id
          }
        },
        order: {
          acquired: "DESC"
        }
      })
      .then((resolve) =>
      {
        return resolve;
      })
      .catch(() =>
      {
        throw new UnprocessableEntityException();
      });
  }

  async create (): Promise<AchievementBox>
  {
    const achBox: AchievementBox = this.achBoxRepository.create();
    return await this.save(achBox);
  }

  async save (achBox: AchievementBox): Promise<AchievementBox>
  {
    return await this.achBoxRepository.save(achBox);
  }

  async removeOne (achBox: AchievementBox): Promise<AchievementBox>
  {
    return await this.achBoxRepository.remove(achBox);
  }

  async clear (): Promise<void>
  {
    const achBoxArr: AchievementBox[] | void = await this.findAll();

    if (achBoxArr)
    {
      achBoxArr.map((achBox) =>
      {
        this.removeOne(achBox);
      });
    }
  }
}