import { Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Message } from "../message/message.entity";

@Entity()
export class MessageBox
{
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => Message, (message) => message.box, {
    eager: true,
    cascade: true
  })
  messages: Message[];
}