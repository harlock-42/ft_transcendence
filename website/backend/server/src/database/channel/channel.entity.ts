import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn
} from "typeorm";
import { Ban } from "../ban/ban.entity";
import { Message } from "../message/message.entity";
import { Mute } from "../mute/mute.entity";
import { User } from "../users/entities/users.entity";

@Entity()
export class Channel
{
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: "varchar",
    length: 100,
    unique: true
  })
  name: string;

  @Column({
    nullable: true
  })
  password: string;

  @Column({
    nullable: true
  })
  topic: string;

  @Column({
    // TODO default: false
  })
  isPrivate: boolean;

  @Column({
    nullable: true
  })
  imgPath: string;

  @ManyToMany(() => User, (user) => user.channels, {
    cascade: true
  })
  users: User[];

  @OneToMany(() => Ban, (ban) => ban.channel)
  @JoinTable()
  banList: Ban[];

  @OneToMany(() => Mute, (mute) => mute.channel)
  @JoinTable()
  muteList: Mute[];

  @ManyToOne(() => User)
  founder: User;

  @ManyToMany(() => User)
  @JoinTable()
  operators: User[];

  @ManyToMany(() => User)
  @JoinTable()
  inviteList: User[];

  @OneToMany(() => Message, (message) => message.channel)
  messages: Message[];
}