import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { AchievementBox } from "../achievementBox/achievementBox.entity";
import { User } from "../users/entities/users.entity";

@Entity()
export class Achievement
{
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 50,
    unique: true
  })
  name: string;

  @Column({
    length: 255
  })
  text: string;

  @Column({})
  imgUrl: string;

  @OneToMany(() => AchievementBox, (achievementBox) => achievementBox.achievement)
  achievementBoxes: AchievementBox[];
}