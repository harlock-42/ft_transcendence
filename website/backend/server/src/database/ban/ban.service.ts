import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeleteResult, Repository } from "typeorm";
import { Channel } from "../channel/channel.entity";
import { Ban } from "./ban.entity";
import { User } from "../users/entities/users.entity";

@Injectable()
export class BanService
{
  private logger = new Logger("Ban Service");

  constructor (@InjectRepository(Ban) private banRepository: Repository<Ban>)
  {
  }

  async save (ban: Ban): Promise<Ban | void>
  {
    return await this.banRepository.save(ban);
  }

  async getAll (): Promise<Ban[] | void>
  {
    return await this.banRepository.find();
  }

  async getOne (channel: Channel, user: User): Promise<Ban>
  {
    return (await this.banRepository.findOne({
      where: {
        user: user,
        channel: channel
      }
    }));
  }

  async create (user: User, timeToEnd: number | undefined): Promise<Ban | void>
  {
    const ban: Ban = this.banRepository.create({
      user: user,
      timeToEnd: timeToEnd
    });
    return (this.save(ban));
  }

  async removeOne (ban: Ban): Promise<Ban | void>
  {
    return await this.banRepository.remove(ban);
  }

  async removeOneById (banId: number): Promise<void | DeleteResult>
  {
    return await this.banRepository.delete(banId);
  }

  async clear (): Promise<void>
  {
    const bans: Ban[] | void = await this.getAll();
    if (!bans)
    {
      return;
    }
    bans.map(async (ban) =>
    {
      await this.banRepository.remove(ban);
    });
  }
}
