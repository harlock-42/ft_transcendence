import { ConsoleLogger, Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Channel } from "diagnostics_channel";
import { DeleteResult, Repository } from "typeorm";
import { Channel as ChannelEntity } from "../channel/channel.entity";
import { User } from "../users/entities/users.entity";
import { Mute } from "./mute.entity";

@Injectable()
export class MuteService
{
  private logger: Logger = new Logger("Mute Service");

  constructor (@InjectRepository(Mute) private muteRepository: Repository<Mute>)
  {
  }

  async save (mute: Mute): Promise<Mute | void>
  {
    return (this.muteRepository.save(mute)
        .then((resolve: Mute | void) =>
        {
          return (resolve);
        })
    );
  }

  async getAll (): Promise<Mute[] | void>
  {
    return (this.muteRepository.find()
        .then((resolve: Mute[]) =>
        {
          return (resolve);
        })
    );
  }

  async getOne (channel: ChannelEntity, user: User): Promise<Mute>
  {
    return (await this.muteRepository.findOne({
      where: {
        user: user,
        channel: channel
      }
    }));
  }

  async create (user: User, timeToEnd: number | undefined): Promise<Mute | void>
  {
    const mute: Mute = this.muteRepository.create({
      user: user,
      timeToEnd: timeToEnd
    });

    return (this.save(mute)
    );
  }

  async removeOne (mute: Mute): Promise<Mute>
  {
    return (this.muteRepository.remove(mute)
        .then((resolve: Mute) =>
        {
          return (resolve);
        })
    );
  }

  async removeOneById (muteId: number): Promise<DeleteResult | void>
  {
    return (this.muteRepository.delete(muteId)
        .then((resolve: DeleteResult) =>
        {
          return (resolve);
        })
    );
  }

  async clear (): Promise<void>
  {
    const muteList: Mute[] | void = await this.getAll();
    if (!muteList)
    {
      return;
    }
    muteList.map((mute) =>
    {
      this.muteRepository.remove(mute);
    });
  }
}