import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeleteResult, Repository } from "typeorm";
import { User } from "../users/entities/users.entity";
import { Block } from "./block.entity";

@Injectable()
export class BlockService
{
  private logger = new Logger("Block Service");

  constructor (
    @InjectRepository(Block)
    private blockRepository: Repository<Block>
  )
  {
  }

  async getAll (): Promise<Block[]>
  {
    return this.blockRepository.find()
      .then((resolve) =>
      {
        return resolve;
      });
  }

  async getOne (owner: User, target: User): Promise<Block>
  {
    return (await this.blockRepository.findOne({
      where: {
        owner: owner,
        targetId: target.id
      }
    }));
  }

  async save (block: Block): Promise<Block | void>
  {
    return this.blockRepository.save(block)
      .then((resolve) =>
      {
        return resolve;
      });
  }

  async create (targetId: number, owner: User): Promise<Block | void>
  {
    const block: Block = this.blockRepository.create({
      targetId,
      owner
    });
    return (this.save(block));
  }

  async clear (): Promise<void>
  {
    const blocks: Block[] = await this.getAll();
    blocks.map(async (block) =>
    {
      await this.blockRepository.delete(block.id);
    });
  }

  async removeOne (block: Block): Promise<Block>
  {
    return (this.blockRepository.remove(block)
        .then((resolve: Block) =>
        {
          return (resolve);
        })
    );
  }

  async deleteOneById (id: number): Promise<DeleteResult>
  {
    return this.blockRepository.delete(id)
      .then((resolve) =>
      {
        return resolve;
      });
  }
}