import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../users/entities/users.entity";

@Entity()
export class Block
{
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  targetId: number;

  @ManyToOne(() => User, (user) => user.blockList)
  owner: User;
}