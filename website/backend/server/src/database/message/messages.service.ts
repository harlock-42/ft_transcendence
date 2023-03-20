import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ChannelsService } from "../channel/channels.service";
import { User } from "../users/entities/users.entity";
import { UsersService } from "../users/services/users.service";
import { MessageDto } from "./message.dto";
import { Message } from "./message.entity";

@Injectable()
export class MessagesService
{
  constructor (
    @InjectRepository(Message) private messageRepository: Repository<Message>,
    private channelService: ChannelsService,
	private userService: UsersService
  )
  {
  }

  async create (owner: User, text: string, date: number): Promise<Message>
  {
    const newMsg: Message = this.messageRepository.create({
      text: text,
      owner,
      date: date
    });
    return await this.messageRepository.save(newMsg);
  }

  async getOneById (idMsg: number): Promise<Message | undefined>
  {
    return await this.messageRepository.findOne({
      where: {
        id: idMsg
      }
    });
  }

  async getChannelFromMsgById (msgId: number): Promise<Message>
  {
    return await this.messageRepository.findOne({
      where: {
        id: msgId
      },
      relations: {
        channel: true,
		owner: true
      }
    });
  }

  async getAll (): Promise<Message[]>
  {
    return await this.messageRepository.find({
      relations: {
        channel: true,
		owner: true
      }
    });
  }

  async clearAll (): Promise<void>
  {
    const msgs: Message[] = await this.getAll();
    if (msgs)
    {
      for (let msg of msgs)
      {
        await this.messageRepository.remove(msg);
      }
    }
  }

  async removeById (idMsg: number): Promise<Message | void>
  {
    const msg: Message | void = await this.messageRepository.findOneBy({ id: idMsg });

    if (msg)
    {
      await this.messageRepository.remove(msg);
    }
  }
}