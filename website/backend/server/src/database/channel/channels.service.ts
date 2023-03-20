import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Ban } from "../ban/ban.entity";
import { Message } from "../message/message.entity";
import { Mute } from "../mute/mute.entity";
import { ChannelDto } from "./channel.dto";
import { Channel } from "./channel.entity";
import { User } from "../users/entities/users.entity";
import { BanService } from "../ban/ban.service";
import { MuteService } from "../mute/mute.service";
import * as bcrypt from "bcrypt";

@Injectable()
export class ChannelsService
{
  constructor (@InjectRepository(Channel)
               private channelRepository: Repository<Channel>,
               private banService: BanService,
               private muteService: MuteService
  )
  {
  }

  async create (channelName: string, founder: User): Promise<Channel | undefined>
  {
    const channel: ChannelDto = {
      name: channelName,
      topic: "",
      founder: founder,
      isPrivate: true,
      users: [founder],
      operators: [founder],
      inviteList: [],
      messages: []
    };
    const newChannel: ChannelDto = this.channelRepository.create(channel);
    return await this.channelRepository.save(newChannel);
  }

  async getOneByName (chanName: string, relationValues: Object = {}): Promise<Channel | undefined>
  {
    return await this.channelRepository.findOne({
      relations: relationValues,
      where: {
        name: chanName
      }
    });
  }

  async getAll (): Promise<Channel[]>
  {
    return await this.channelRepository.find({
      relations: {
        users: true,
        messages: true,
        banList: true,
        inviteList: true,
        founder: true,
        operators: true
      }
    });
  }

  async addUser (chan: Channel, user: User): Promise<Channel>
  {
    const userChan = this.getUser(chan, user);

    if (userChan || !user)
    {
      return undefined;
    }
    if (!chan.users)
    {
      chan.users = [];
    }
    chan.users.push(user);
    return await this.channelRepository.save(chan);
  }

  getAllUsers (channel: Channel): User[]
  {
    return channel.users;
  }

  async addMsg (chan: Channel, msg: Message): Promise<Channel>
  {
    if (!chan.messages)
    {
      chan.messages = [];
    }
    chan.messages.push(msg);
    return await this.channelRepository.save(chan);
  }

  async getMsgByChanName (chanName: string): Promise<undefined | Message[]>
  {
    const chan: Channel | void = await this.getOneByName(chanName, { 
		messages: {
			owner: true
		},
	});

    if (!chan)
    {
      return (undefined);
    }
    return (chan.messages);
  }

  getUser (channel: Channel, user: User): User | undefined
  {
    if (!channel.users)
    {
      return undefined;
    }
    return channel.users.find((userChan) => userChan.id === user.id);
  }

  async clear (): Promise<void>
  {
    const channels: Channel[] = await this.channelRepository.find();

    for (let channel of channels)
    {
      await this.channelRepository.remove(channel);
    }
  }

  async removeById (idChannel: number): Promise<void>
  {
    const channel: Channel | void = await this.channelRepository.findOneBy({ id: idChannel });

    if (channel)
    {
      await this.channelRepository.remove(channel);
    }
  }

  async muteUser (channel: Channel, mute: Mute | void): Promise<void | Channel>
  {
    if (!mute)
    {
      return;
    }
    if (!channel.muteList)
    {
      channel.muteList = [];
    }
    if (!this.isMuted(channel, mute.user))
    {
      channel.muteList.push(mute);
    }
    return await this.channelRepository.save(channel);
  }

  async unmuteUser (channel: Channel, user: User): Promise<Channel>
  {
    channel.muteList = channel.muteList.filter((value: Mute) =>
    {
      return (value.user.id !== user.id);
    });
    return (await this.channelRepository.save(channel));
  }

  async kickUser (channel: Channel, nickname: string): Promise<Channel>
  {
    channel.users = channel.users.filter(function(value, index, arr)
    {
      return value.nickname !== nickname;
    });
    return await this.channelRepository.save(channel);
  }

  async banUser (chan: Channel, ban: Ban | void): Promise<Channel | void>
  {
    if (!ban)
    {
      return;
    }
    if (!chan.banList)
    {
      chan.banList = [];
    }
    if (!chan.banList.find((userBan) =>
    {
      return (userBan.id === ban.id);
    }))
    {
      chan.banList.push(ban);
    }
    return await this.channelRepository.save(chan);
  }

  async unbanUser (chan: Channel, user: User): Promise<Channel>
  {
    if (!chan.banList)
    {
      return (chan);
    }

    chan.banList = chan.banList.filter((value) =>
    {
      return value.user.id !== user.id;
    });
    return await this.channelRepository.save(chan);
  }

  async checkPassword (channel: Channel, password: string): Promise<boolean>
  {
    if (!password)
    {
      return (false);
    }
    return (await bcrypt.compare(password, channel.password));
  }

  async setPassword (channel: Channel, password: string): Promise<Channel>
  {
    if (!password)
    {
      channel.password = null;
    } else
    {
      const hash = await bcrypt.hash(password, 5);
      channel.password = hash;
    }
    return (await this.channelRepository.save(channel));
  }

  async setPublic (channel: Channel): Promise<Channel>
  {
    channel.isPrivate = false;
    return (await this.channelRepository.save(channel));
  }

  async setPrivate (channel: Channel): Promise<Channel>
  {
    channel.isPrivate = true;
    return (await this.channelRepository.save(channel));
  }

  async setTopic (channel: Channel, topic: string): Promise<Channel>
  {
    channel.topic = topic;
    return (await this.channelRepository.save(channel));
  }

  async setImagePath (channel: Channel, imgPath: string): Promise<Channel>
  {
    channel.imgPath = imgPath;
    return (await this.channelRepository.save(channel));
  }

  async isPrivate (channelName: string): Promise<boolean>
  {
    const channel: Channel = await this.getOneByName(channelName);

    return (channel.isPrivate);
  }

  async isBanned (channel: Channel, user: User): Promise<boolean>
  {
    const userBanned: Ban | void = channel.banList.find((value: Ban) =>
    {
      return (value.user.id === user.id);
    });

    if (userBanned)
    {
      return (this.checkBanTimeout(channel, userBanned));
    }
    return (false);
  }

  isMuted (channel: Channel, user: User): boolean
  {
    const userMuted: Mute | void = channel.muteList.find((mutedUser: Mute) =>
    {
      return (mutedUser.user.id === user.id);
    });

    if (userMuted)
    {
      return (this.checkMuteTimeout(channel, userMuted));
    }
    return (false);
  }

  /// Returns false and unban the user if timeout has expired, otherwise returns true
  checkBanTimeout (channel: Channel, userBanned: Ban): boolean
  {
    if (userBanned.timeToEnd && userBanned.timeToEnd - Date.now() <= 0)
    {
      this.banService.removeOne(userBanned);
      this.unbanUser(channel, userBanned.user);
      return (false);
    }
    return (true);
  }

  /// Same for mute
  checkMuteTimeout (channel: Channel, userMuted: Mute): boolean
  {
    if (userMuted.timeToEnd && userMuted.timeToEnd - Date.now() <= 0)
    {
      this.muteService.removeOne(userMuted);
      this.unmuteUser(channel, userMuted.user);
      return (false);
    }
    return (true);
  }

  async getBanlist (channelName: string): Promise<Ban[] | undefined>
  {
    const channel: Channel | void = await this.getOneByName(channelName, {
      banList: true
    });
    if (!channel)
    {
      return (undefined);
    }
    return (channel.banList);
  }

  isOperator (channel: Channel, user: User): boolean
  {
    if (!channel.operators)
    {
      return false;
    }
    const userOp: User[] = channel.operators.filter((value) =>
    {
      return value.id === user.id;
    });
    if (userOp.length > 0)
    {
      return true;
    } else
    {
      return false;
    }
  }

  isFounder (channel: Channel, user: User): boolean
  {
    if (channel.founder.id === user.id)
    {
      return true;
    } else
    {
      return false;
    }
  }

  //TODO invite list, isInvited, invite

  async setfounder (newFounder: User, channelName: string): Promise<Channel>
  {
    const channel: Channel = await this.getOneByName(channelName, {
      founder: true
    });
    channel.founder = newFounder;
    return await this.channelRepository.save(channel);
  }

  async addOperator (channel: Channel, target: User): Promise<Channel>
  {
    channel.operators.push(target);
    return await this.channelRepository.save(channel);
  }

  async removeOperator (channel: Channel, target: User): Promise<Channel>
  {
    channel.operators = channel.operators.filter((element) =>
    {
      return element.id !== target.id;
    });
    return await this.channelRepository.save(channel);
  }

  async getInviteList (channelName: string): Promise<User[] | undefined>
  {
    const channel: Channel | void = await this.getOneByName(channelName, {
      inviteList: true
    });
    if (!channel)
    {
      return (undefined);
    }
    return (channel.inviteList);
  }

  isInvited (user: User, channel: Channel): boolean
  {
    const inviteUser: User = channel.inviteList.find((element) => element.id === user.id);
    if (inviteUser)
    {
      return true;
    } else
    {
      return false;
    }
  }

  async addUserToInviteList (user: User, channel: Channel): Promise<Channel>
  {
    channel.inviteList.push(user);
    return await this.channelRepository.save(channel);
  }

  async removeUserFromInviteList (user: User, channel: Channel): Promise<Channel>
  {
    channel.inviteList = channel.inviteList.filter((element) =>
    {
      return element.id !== user.id;
    });
    return await this.channelRepository.save(channel);
  }
}