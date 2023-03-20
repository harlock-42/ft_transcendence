import { Channel } from "../channel/channel.entity";

export class MessageDto
{
  text: string;

  channel: Channel;

  nickname: string;
}