import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Channel } from "../channel/channel.entity";
import { User } from "../users/entities/users.entity";

@Entity()
export class Mute
{
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: "bigint",
    nullable: true
  })
  timeToEnd?: number;

  @ManyToOne(() => User, {
    eager: true
  })
  user: User;

  @ManyToOne(() => Channel)
  channel: Channel;
}