import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { MessageBox } from "../messageBox/messageBox.entity";
import { User } from "../users/entities/users.entity";

@Entity()
export class PrivateMessage
{
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => MessageBox, {
    eager: true
  })
  box: MessageBox;

  @ManyToOne(() => User, {
    eager: true
  })
  user: User;

  @ManyToOne(() => User, (user) => user.privateMsg, {
    cascade: true
  })
  owner: User;
}