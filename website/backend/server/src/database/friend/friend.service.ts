import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Friend, FriendStatus } from "./friend.entity";
import { FriendInterface } from "./interfaces/friend.interface";

@Injectable()
export class FriendService
{
  constructor (
    @InjectRepository(Friend)
    private friendRepository: Repository<Friend>
  )
  {
  }

  async getAll (): Promise<Friend[]>
  {
    return await this.friendRepository.find();
  }

  async create (idTarget: number, status: FriendStatus): Promise<Friend>
  {
    const friend: FriendInterface = this.friendRepository.create({
      friendId: idTarget,
      status: status
    });
    return await this.friendRepository.save(friend);
  }

  async changeStatus (friend: Friend, status: FriendStatus): Promise<Friend>
  {
    friend.status = status;
    return await this.friendRepository.save(friend);
  }

  async removeOne (friend: Friend): Promise<Friend>
  {
    return await this.friendRepository.remove(friend);
  }

  async clear (): Promise<void>
  {
    const friends: Friend[] = await this.getAll();
    for (let friend of friends)
    {
      await this.friendRepository.remove(friend);
    }
  }
}