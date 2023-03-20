import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./users.entity";

@Entity()
export class TwoFactorAuth
{
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    default: false
  })
  activate: boolean;

  @Column({
    nullable: true
  })
  secret: string;

  @OneToOne(() => User)
  @JoinColumn()
  owner: User;
}