import { User } from "src/database/users/entities/users.entity";
import { Message } from "../message/message.entity";

export class ChannelDto
{
  name: string;

  topic: string;

  founder: User;

  isPrivate: boolean;

  users: User[];

  operators: User[];

  inviteList: User[];

  messages: Message[];
}