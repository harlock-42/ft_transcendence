export interface AchievementInfo {
    name: string;
    imgUrl: string;
    text: string;
}

export interface AchievementBoxInfo {
    acquired: boolean;
    achievement: AchievementInfo;
}

export interface MatchInfo {
    isWinner: boolean;
    opponent: {
        nickname: string;
    }
}

export interface TFAuthInfo {
    activate: boolean;
}

export interface UserInfo {
    myNickname: string;
    nickname: string;
    id: number;
    image: string | undefined;
    imgUrl: string;
    nbWin: number;
    nbLoose: number;
    elo: number;
    achievementBoxes: AchievementBoxInfo[];
    matchs: MatchInfo[];
    twoFactorAuth: TFAuthInfo;
}