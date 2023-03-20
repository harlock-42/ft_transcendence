import { Column, Entity, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Achievement } from "../achievement/achievement.entity";
import { User } from "../users/entities/users.entity";

@Entity()
export class AchievementBox
{
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: "boolean",
    default: false
  })
  acquired: boolean;

  @ManyToOne(() => Achievement, {
    eager: true
  })
  achievement: Achievement;

  @ManyToOne(() => User, (user) => user.achievementBoxes, {
    cascade: [
      "remove"
    ]
  })
  user: User;
}