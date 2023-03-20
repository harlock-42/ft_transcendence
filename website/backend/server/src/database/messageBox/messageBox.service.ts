import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { runInThisContext } from "vm";
import { Message } from "../message/message.entity";
import { MessageBox } from "./messageBox.entity";

@Injectable()
export class MessageBoxService
{
  constructor (
    @InjectRepository(MessageBox)
    private messageBoxRepository: Repository<MessageBox>
  )
  {
  }

  async getOneById (id: number): Promise<MessageBox>
  {
    return await this.messageBoxRepository.findOne({
      where: {
        id: id
      }
    });
  }

  async create (): Promise<MessageBox>
  {
    const msgBox = this.messageBoxRepository.create();
    return await this.messageBoxRepository.save(msgBox);
  }

  async addMessage (box: MessageBox, msg: Message): Promise<MessageBox>
  {
    if (!box.messages)
    {
      box.messages = [];
    }
    box.messages.push(msg);
    return await this.messageBoxRepository.save(box);
  }

  async clear (): Promise<void>
  {
    const array: MessageBox[] = await this.messageBoxRepository.find();

    for (let element of array)
    {
      await this.messageBoxRepository.remove(element);
    }
  }

}