import { User } from "src/database/users/entities/users.entity";

export class TwoFactorAuthDto
{
  activate: boolean;
  secret: string;
  owner: User;
}