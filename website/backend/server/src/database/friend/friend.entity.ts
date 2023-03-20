import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn
} from "typeorm";
import { User } from "../users/entities/users.entity";

export enum FriendStatus
{
  ACCEPTED = 0,
  PENDING,
  INCOMING
}

@Entity()
export class Friend
{
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: false
  })
  friendId: number;

  @Column({
    type: "enum",
    enum: FriendStatus,
    default: FriendStatus.PENDING
  })
  status: FriendStatus;

  @ManyToOne(() => User, (user) => user.friends)
  user: User;
}