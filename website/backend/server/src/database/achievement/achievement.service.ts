import { HttpException, Injectable, NotFoundException, UnprocessableEntityException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { table } from "console";
import { resolve } from "path";
import { Repository } from "typeorm";
import { AchievementBox } from "../achievementBox/achievementBox.entity";
import { AchievementBoxService } from "../achievementBox/achievementBox.service";
import { Friend } from "../friend/friend.entity";
import { Match } from "../match/match.entity";
import { User } from "../users/entities/users.entity";
import { UsersService } from "../users/services/users.service";
import { Achievement as AchievementEntity } from "./achievement.entity";
import { AchievementDto } from "./dtos/achievement.dto";
import { AchievementArrayDto } from "./dtos/achievementArray.dto";
import { Achievement } from "./interfaces/achievement.interface";

@Injectable()
export class AchievementService
{
  constructor (@InjectRepository(AchievementEntity)
               private achRepository: Repository<AchievementEntity>,
               private usersService: UsersService,
               private achBoxService: AchievementBoxService
  )
  {
  }

  async save (ach: AchievementEntity): Promise<AchievementEntity>
  {
    return await this.achRepository.save(ach);
  }

  async findOne (id: number): Promise<AchievementEntity>
  {
    return await this.achRepository.findOne({
        where: {
          id: id
        }
      })
      .then((resolve) =>
      {
        return resolve;
      })
      .catch((error) =>
      {
        throw new UnprocessableEntityException();
      });
  }

  async getAll (): Promise<AchievementEntity[]>
  {
    return this.achRepository.find()
      .then((resolve) =>
      {
        return resolve;
      })
      .catch((error) =>
      {
        throw new UnprocessableEntityException();
      });
  }

  async create (ach: AchievementDto): Promise<AchievementEntity>
  {
    const newAch: Achievement = this.achRepository.create(ach);
    return this.achRepository.save(newAch)
      .then((resolve) =>
      {
        return resolve;
      })
      .catch((error) =>
      {
        throw new UnprocessableEntityException();
      });
  }

  async clear (): Promise<void>
  {
    const arrAch: AchievementEntity[] = await this.achRepository.find();

    arrAch.map(async (ach) =>
    {
      this.achRepository.remove(ach)
        .then((resolve) =>
        {
          return resolve;
        })
        .catch((error) =>
        {
          throw new UnprocessableEntityException();
        });
    });
  }

  async clearAchievementBox (): Promise<void>
  {
    const arrAch: AchievementEntity[] = await this.achRepository.find();

    arrAch.map(async (ach) =>
    {
      ach.achievementBoxes = [];
      await this.save(ach);
    });
  }

  async assignToUsers (achievement: AchievementEntity): Promise<void>
  {
    const users: User[] = await this.usersService.getAll({
      relations: [
        "achievementBoxes"
      ]
    });
    users.map(async (user) =>
    {
      let checkBox: AchievementBox[] = user.achievementBoxes.filter((achBox) =>
      {
        return achBox.achievement.name === achievement.name;
      });
      if (checkBox.length > 0)
      {
        return;
      }
      let achBox: AchievementBox = await this.achBoxService.create();
      achBox.achievement = achievement;
      achBox = await this.achBoxService.save(achBox);
      user.achievementBoxes.push(achBox);
      this.usersService.save(user);
    });
  }

  // KEEP
  async updateUser (user: User): Promise<User>
  {
    const achArr: AchievementEntity[] = await this.getAll();
    if (achArr)
    {
      achArr.map(async (ach) =>
      {
        const found: AchievementBox[] = user.achievementBoxes.filter((achBox) =>
        {
          return achBox.achievement.name === ach.name;
        });
        if (found.length === 0)
        {
          let achBox: AchievementBox = await this.achBoxService.create();
          achBox.achievement = ach;
          achBox = await this.achBoxService.save(achBox);
          user.achievementBoxes.push(achBox);
        }
        await this.usersService.save(user);
      });
    }
    return user;
  }

  async createMany (achArray: AchievementArrayDto): Promise<Promise<AchievementEntity>[]>
  {
    return achArray.achievements.map(async (ach) =>
    {
      return await this.create(ach);
    });
  }

  async compareAll (achArray: AchievementArrayDto): Promise<boolean>
  {
    const ach: AchievementEntity[] = await this.getAll();

    if (achArray.achievements.length !== ach.length)
    {
      return (false);
    }

    let achCompare: AchievementDto[] = [];

    ach.forEach((ach: AchievementEntity) =>
    {
      achCompare.push({
        name: ach.name,
        text: ach.text,
        imgUrl: ach.imgUrl
      });
    });
    for (let i = 0; i < achCompare.length; ++i)
    {
      let checker: boolean = false;
      for (let j = 0; j < achArray.achievements.length; ++j)
      {
        if (achCompare[i].name === achArray.achievements[j].name)
        {
          checker = true;
          break;
        }
      }
      if (!checker)
      {
        return (false);
      }
    }
    return (true);
  }

  async saveImgUrl (id: number, imgUrl: string): Promise<AchievementEntity>
  {
    const ach: AchievementEntity = await this.findOne(id);
    ach.imgUrl = imgUrl;
    return this.save(ach);
  }

  async playGame (user: User, achBox: AchievementBox, nbGame: number): Promise<AchievementBox>
  {
    if (user.matchs.length >= nbGame)
    {
      achBox.acquired = true;
      return this.achBoxService.save(achBox);
    }
  }

  async fannyWinner (achBox: AchievementBox, match: Match): Promise<AchievementBox | void>
  {
    if (match.isWinner === true && match.looserScore === 0)
    {
      achBox.acquired = true;
      return this.achBoxService.save(achBox);
    }
  }

  async fannyLoser (achBox: AchievementBox, match: Match): Promise<AchievementBox | void>
  {
    if (match.isWinner === false && match.looserScore === 0)
    {
      achBox.acquired = true;
      return this.achBoxService.save(achBox);
    }
  }

  async friendly (user: User, achBox: AchievementBox, match: Match): Promise<AchievementBox | void>
  {
    if (match.isWinner === true && user)
    {
      const filter: Friend[] = user.friends.filter((friend) =>
      {
        return friend.friendId === match.opponent.id;
      });
      if (filter.length > 0)
      {
        achBox.acquired = true;
        return this.achBoxService.save(achBox);
      }
    }
  }

  async rowWinner (user: User, achBox: AchievementBox, nbWin: number): Promise<AchievementBox | void>
  {
    const matchsWin: Match[] = user.matchs.filter((match) =>
    {
      return match.isWinner === true;
    });
    if (matchsWin.length >= nbWin)
    {
      achBox.acquired = true;
      return this.achBoxService.save(achBox);
    }
  }

  async check (user: User, latestMatch: Match): Promise<void>
  {
    if (!user.achievementBoxes || user.achievementBoxes.length === 0)
    {
      return;
    }
    user.achievementBoxes.map(async (achBox) =>
    {
      switch (achBox.achievement.name)
      {
        case "Visible":
          if (achBox.acquired !== true)
          {
            await this.playGame(user, achBox, 1);
          }
          break;
        case "Intermediate":
          if (achBox.acquired !== true)
          {
            await this.playGame(user, achBox, 5);
          }
          break;
        case "Advanced":
          if (achBox.acquired !== true)
          {
            await this.playGame(user, achBox, 10);
          }
          break;
        case "Old school":
          if (achBox.acquired !== true)
          {
            await this.playGame(user, achBox, 15);
          }
          break;
        case "Godlike":
          if (achBox.acquired !== true)
          {
            await this.fannyWinner(achBox, latestMatch);
          }
          break;
        case "Humiliated":
          if (achBox.acquired !== true)
          {
            await this.fannyLoser(achBox, latestMatch);
          }
          break;
        case "Friendly":
          if (achBox.acquired !== true)
          {
            await this.friendly(user, achBox, latestMatch);
          }
          break;
        case "Killing spree":
          if (achBox.acquired !== true)
          {
            await this.rowWinner(user, achBox, 5);
          }
          break;
        case "Dominating":
          if (achBox.acquired !== true)
          {
            await this.rowWinner(user, achBox, 10);
          }
          break;
        case "Legendary":
          if (achBox.acquired !== true)
          {
            await this.rowWinner(user, achBox, 15);
          }
          break;
      }
    });
  }
}