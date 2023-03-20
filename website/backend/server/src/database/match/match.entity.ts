import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import { User } from "../users/entities/users.entity";

@Entity()
export class Match
{
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  UpdatedAt: Date;

  @Column()
  isWinner: boolean;
  @Column()
  looserScore: number;

  @Column()
  elo: number;

  @ManyToOne(() => User, (user) => user.matchs)
  user: User;
  @ManyToOne(() => User, {
    eager: true
  })
  opponent: User;
}