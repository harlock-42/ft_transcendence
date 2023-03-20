import { Channel } from "src/database/channel/channel.entity";
import { Column, Entity, JoinTable, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Friend } from "src/database/friend/friend.entity";
import { PrivateMessage } from "src/database/privateMessage/privateMessage.entity";
import { Block } from "src/database/block/block.entity";
import { AchievementBox } from "src/database/achievementBox/achievementBox.entity";
import { Match } from "src/database/match/match.entity";
import { TwoFactorAuth } from "./twoFactorAuth.entity";

@Entity()
export class User
{
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: true
  })
  ft_id: number;

  @Column({
    nullable: true
  })
  nickname: string;

  @Column({
    default: "userDefault.jpeg"
  })
  imgUrl: string;

  @Column({
    default: 0
  })
  nbWin: number;

  @Column({
    default: 0
  })
  nbLoose: number;

  @Column({
    default: 500
  })
  elo: number;

  @Column({ // TODO DELETE
    nullable: true
  })
  password: string;

  @ManyToMany(() => Channel, (channel) => channel.users)
  @JoinTable()
  channels: Channel[];

  @OneToMany(() => AchievementBox, (achievementBox) => achievementBox.user)
  @JoinTable()
  achievementBoxes: AchievementBox[];

  @OneToMany(() => Match, (match) => match.user, {
    cascade: true
  })
  matchs: Match[];

  @OneToMany(() => Friend, (friend) => friend.user, {
    cascade: true
  })
  friends: Friend[];

  @OneToMany(() => Block, (block) => block.owner, {
    cascade: true
  })
  blockList: Block[];

  @OneToMany(() => PrivateMessage, (privateMessage) => privateMessage.owner)
  privateMsg: PrivateMessage[];

  @OneToOne(() => TwoFactorAuth, (TwoFactorAuth) => TwoFactorAuth.owner, {
    cascade: true
  })
  twoFactorAuth: TwoFactorAuth;
}