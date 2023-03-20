import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { MessageBox } from "../messageBox/messageBox.entity";
import { PrivateMessage } from "./privateMessage.entity";
import { User } from "../users/entities/users.entity";
import { RelationsUserDto } from "../users/dtos/relationsUser.dto";

@Injectable()
export class PrivateMessageService
{
  constructor (
    @InjectRepository(PrivateMessage)
    private privateMessageRepository: Repository<PrivateMessage>
  )
  {
  }

  async getAll (): Promise<PrivateMessage[]>
  {
    return await this.privateMessageRepository.find();
  }

  async create (user: User, target: User, msgBox: MessageBox): Promise<PrivateMessage>
  {
    const privateMsg: PrivateMessage = new PrivateMessage;

    privateMsg.owner = user;
    privateMsg.user = target;
    privateMsg.box = msgBox;
    const newPrivateMsg: PrivateMessage = this.privateMessageRepository.create(privateMsg);
    return await this.privateMessageRepository.save(newPrivateMsg);
  }

  async removeOne (privateMessage: PrivateMessage): Promise<PrivateMessage>
  {
    return (await this.privateMessageRepository.remove(privateMessage));
  }

  async getOneByTarget (user: User, target: User, relations = {}): Promise<PrivateMessage>
  {
    return (await this.privateMessageRepository.findOne({
      relations: relations,
      where: {
        owner: user,
        user: target
      }
    }));
  }

  async clear (): Promise<void>
  {
    const array: PrivateMessage[] = await this.privateMessageRepository.find();

    for (let element of array)
    {
      await this.privateMessageRepository.remove(element);
    }
  }
}