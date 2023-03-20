import { Exclude } from "class-transformer";
import { AchievementBox } from "src/database/achievementBox/achievementBox.entity";
import { TwoFactorAuth } from "../entities/twoFactorAuth.entity";

export class SerializedUser {
	id: number
	nickname: string;
	ft_id: number;
	imgUrl: string;
	nbWin: number;
	nbLoose: number;
	@Exclude()
	password: string
	elo: number
	achievementBoxes?: AchievementBox[];
	twoFactorAuth?: TwoFactorAuth;
}