import { Injectable, UnauthorizedException, UnprocessableEntityException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AchievementService } from "../achievement/achievement.service";
import { User } from "../users/entities/users.entity";
import { UsersService } from "../users/services/users.service";
import { MatchDto } from "./dtos/match.dto";
import { Match } from "./match.entity";

@Injectable()
export class MatchService
{
  constructor (
    @InjectRepository(Match)
    private matchRepository: Repository<Match>,
    private userService: UsersService,
    private achService: AchievementService
  )
  {
  }

  async getAll (): Promise<Match[]>
  {
    return await this.matchRepository.find()
      .then((resolve) =>
      {
        return resolve;
      })
      .catch((error) =>
      {
        throw new UnprocessableEntityException();
      });
  }

  async create (match: MatchDto): Promise<Match>
  {
    const newMatch: MatchDto = this.matchRepository.create(match);
    return await this.matchRepository.save(newMatch);
  }

  async clear ()
  {
    const matchs = await this.getAll();

    for (let match of matchs)
    {
      this.matchRepository.remove(match)
        .then((resolve) =>
        {
          return resolve;
        })
        .catch((error) =>
        {
          throw new UnauthorizedException();
        });
    }
  }

  eloWon (eloDiff: number): number
  {
    return 5;
  }

  eloLost (eloDiff: number): number
  {
    return -5;
  }

  async addMatch (winner: User, loser: User, looserScore: number): Promise<Match | undefined>
  {
    const matchWinner: Match = await this.create({
      isWinner: true,
      looserScore: looserScore,
      opponent: loser,
      elo: this.eloWon(loser.elo - winner.elo)
    });
    if (!matchWinner)
    {
      return undefined;
    }
    const matchLoser: Match = await this.create({
      isWinner: false,
      looserScore: looserScore,
      opponent: winner,
      elo: this.eloLost(winner.elo - loser.elo)
    });

    if (!matchLoser)
    {
      return undefined;
    }

    const newWinner: User = await this.userService.addMatch(winner, matchWinner);
    const newLoser: User = await this.userService.addMatch(loser, matchLoser);
    await this.achService.check(newWinner, matchWinner);
    await this.achService.check(newLoser, matchLoser);
    return matchWinner;
  }
}