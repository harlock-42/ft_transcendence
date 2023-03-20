import { Column, Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Channel } from "../channel/channel.entity";
import { MessageBox } from "../messageBox/messageBox.entity";
import { PrivateMessage } from "../privateMessage/privateMessage.entity";
import { User } from "../users/entities/users.entity";

@Entity()
export class Message
{
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: "varchar",
    length: 255
  })
  text: string;

  @ManyToOne(() => User)
  owner: User;

  @Column({
    type: "bigint"
  })
  date: number;

  @ManyToOne(() => Channel, (channel) => channel.messages, { eager: true })
  channel: Channel;

  @ManyToOne(() => MessageBox, (msgBox) => msgBox.messages)
  box: MessageBox;
}