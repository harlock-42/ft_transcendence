import { ConsoleLogger, Injectable, NotFoundException, UnprocessableEntityException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Channel } from "src/database/channel/channel.entity";
import { DataSource, In, Repository } from "typeorm";
import { UserDto } from "../dtos/user.dto";
import { User, User as UserEntity } from "../entities/users.entity";
import { AchievementService } from "../../achievement/achievement.service";
import { Achievement } from "../../achievement/achievement.entity";
import { Match } from "../../match/match.entity";
import { PrivateMessage } from "../../privateMessage/privateMessage.entity";
import { RelationsUserDto } from "../dtos/relationsUser.dto";
import { Friend } from "../../friend/friend.entity";
import { FriendService } from "../../friend/friend.service";
import { Block } from "src/database/block/block.entity";
import { RegisterDto } from "../dtos/register.dto";
import * as bcrypt from "bcrypt";
import { AchievementBoxService } from "src/database/achievementBox/achievementBox.service";
import { TwoFactorAuthService } from "src/database/users/services/twoFactorAuth.service";
import { TwoFactorAuth } from "../entities/twoFactorAuth.entity";
import { AchievementBox } from "src/database/achievementBox/achievementBox.entity";

@Injectable()
export class UsersService
{
  constructor (@InjectRepository(UserEntity)
               private userRepository: Repository<UserEntity>,
               private dataSource: DataSource,
               private friendService: FriendService,
               private achBoxService: AchievementBoxService,
               private tfaService: TwoFactorAuthService
  )
  {
  }

  /* ************************ */
  /* *** DATABASE METHODS *** */
  /* ************************ */

  /*
  ** return all the users
  */

  async getAll (relationsUser?: RelationsUserDto): Promise<UserEntity[]>
  {
    if (!relationsUser)
    {
      return (await this.userRepository.find());
    }
    return this.userRepository.find({
        relations: relationsUser.relations
      })
      .then((resolve: User[]) =>
      {
        return resolve;
      })
      .catch(() =>
      {
        throw new UnprocessableEntityException();
      });
  }

  async getManyByids (ids: number[]): Promise<User[]>
  {
    return this.userRepository.find({
        where: {
          id: In(ids)
        }
      })
      .then((resolve: User[]) =>
      {
        return resolve;
      })
      .catch(() =>
      {
        throw new UnprocessableEntityException();
      });
  }

  async findOne (id: number, relations: Object = {}): Promise<User>
  {
    return this.userRepository.findOne({
        where: {
          id: id
        },
        relations: relations
      })
      .then((resolve) =>
      {
        return resolve;
      })
      .catch(() =>
      {
        throw new UnprocessableEntityException();
      });
  }

  async getIdByNickname (nickname: string): Promise<number | undefined>
  {
    return await this.userRepository.findOne({
        where: {
          nickname: nickname
        }
      })
      .then((resolve: User) =>
      {
        if (!resolve)
        {
          return undefined;
        }
        return resolve.id;
      });
  }

  async ranking (): Promise<User[]>
  {
    return this.userRepository.find({
        order: {
          elo: "DESC",
          nbWin: "DESC",
          id: "ASC"
        }
      })
      .then((resolve: User[]) =>
      {
        return resolve;
      })
      .catch(() =>
      {
        throw new UnprocessableEntityException();
      });
  }

  async getNickname (id: number): Promise<string>
  {
    const user: User | undefined = await this.getOneById(id);
    if (user)
    {
      return user.nickname;
    } else
    {
      throw new NotFoundException();
    }
  }

  async setNickname (id: number, nickname: string): Promise<User>
  {
    const user: User = await this.getOneById(id);
    if (user)
    {
      user.nickname = nickname;
      return this.save(user);
    }
    throw new NotFoundException();
  }

  async getProfilById (id: number): Promise<User>
  {
    return (await this.userRepository.findOne({
      where: {
        id: id
      },
      relations: {
        achievementBoxes: true,
        matchs: true,
        channels: true,
        privateMsg: true,
        friends: true,
        blockList: true
      }
    }));
  }

  async saveImg (id: number, url: string): Promise<User>
  {
    const user: User = await this.getOneById(id);
    user.imgUrl = url;
    return this.save(user);
  }

  async getImgUrlByNickname (nick: string): Promise<string>
  {
    return this.userRepository.findOne({
        where: {
          nickname: nick
        }
      })
      .then((resolve: User | undefined) =>
      {
        return resolve.imgUrl;
      })
      .catch(() =>
      {
        throw new UnprocessableEntityException();
      });
  }

  async getImgUrl (id: number): Promise<undefined | string>
  {
    const user: User = await this.userRepository.findOne({
      where: {
        id: id
      }
    });
    if (!user)
    {
      return undefined;
    } else
    {
      return user.imgUrl;
    }
  }

  async register (registerDto: RegisterDto)
  {
    const hash = await bcrypt.hash(registerDto.password, 5);
    const tfa = await this.tfaService.createOne();
    const user = {
      nickname: registerDto.nickname,
      password: hash,
      achievementBoxes: [],
      twoFactorAuth: tfa ? tfa : undefined
    };
    const newUser = this.userRepository.create(user);
    return this.userRepository.save(newUser)
      .then((resolve) =>
      {
        return resolve;
      })
      .catch((error) =>
      {
        throw new UnprocessableEntityException();
      });
  }

  async getOneById (id: number): Promise<User | undefined>
  {
    return this.userRepository.findOne({
        where: {
          id: id
        },
        relations: {
          matchs: true,
          channels: true,
          achievementBoxes: true,
          privateMsg: true,
          friends: true,
          blockList: true,
          twoFactorAuth: true
        }
      })
      .then((resolve: User) =>
      {
        return resolve;
      })
      .catch(() =>
      {
        return undefined;
      });
  }

  /*
  ** Create a new user
  */

  async create (userDto: UserDto): Promise<User>
  {
    const newUser: User = this.userRepository.create(userDto);
    return this.userRepository.save(newUser) //TODO await maybe needed
      .then((resolve: User) =>
      {
        return resolve;
      })
      .catch(() =>
      {
        throw new UnprocessableEntityException();
      });
  }

  // KEEP
  async save (user: User): Promise<User>
  {
    return await this.userRepository.save(user)
      .then((resolve: User) =>
      {
        return resolve;
      })
      .catch(() =>
      {
        throw new UnprocessableEntityException();
      });
  }

  /*
  ** return a user in function of his nickname.
  */


  async getOneByNickname (nick: string, relations = {}): Promise<UserEntity | undefined>
  {
    return await this.userRepository.findOne({
        relations: relations,
        where: {
          nickname: nick
        }
      })
      .then((resolve: User) =>
      {
        return resolve;
      })
      .catch(() =>
      {
        throw new UnprocessableEntityException();
      });
  }

  async getProfilByNickname (nick: string): Promise<UserEntity | undefined>
  {
    const user = await this.userRepository.findOne({
        relations: {
          twoFactorAuth: true,
          matchs: true
        },
        where: {
          nickname: nick
        }
      })
      .then((resolve: User) =>
      {
        return resolve;
      })
      .catch(() =>
      {
        throw new UnprocessableEntityException();
      });
	  if (!user) {
		throw new NotFoundException()
	  }
	  user.achievementBoxes = await this.achBoxService.findByUser(user);
    return user;
  }

  async removeChannel (user: UserEntity, channelName: string): Promise<User>
  {
    user.channels = user.channels.filter(function(value, index, arr)
    {
      return value.name !== channelName;
    });
    return this.userRepository.save(user)
      .then((resolve: User) =>
      {
        return resolve;
      });
  }

  async getNbWinByNickname (nick: string): Promise<number>
  {
    return this.userRepository.findOne({
        where: {
          nickname: nick
        }
      })
      .then((resolve: User) =>
      {
        return resolve.nbWin;
      })
      .catch(() =>
      {
        throw new UnprocessableEntityException();
      });
  }

  async getNbLooseByNickname (nick: string): Promise<number>
  {
    return this.userRepository.findOne({
        where: {
          nickname: nick
        }
      })
      .then((resolve: User) =>
      {
        return resolve.nbLoose;
      })
      .catch(() =>
      {
        throw new UnprocessableEntityException();
      });
  }

  /*
  ** Return the Id of a user in function of his nickname.
  */

  async getIdByNick (nick: string): Promise<number | undefined>
  {
    const user: User[] = await this.userRepository.find();
    return this.userRepository.findOne({
        where: { nickname: nick }
      })
      .then((resolve: User) =>
      {
        return resolve.id;
      })
      .catch(() =>
      {
        throw new UnprocessableEntityException();
      });
  }

  /*
  ** Delete a user in function of his nickname.
  */

  async remove (nick: string): Promise<UserEntity | undefined>
  {
    const user: User = await this.getOneByNickname(nick);

    return this.userRepository.remove(user)
      .then((resolve) =>
      {
        return resolve;
      })
      .catch(() =>
      {
        throw new UnprocessableEntityException();
      });
  }

  /*
  ** Say if the user exist by his nickname
  */

  async isExist (nick: string): Promise<boolean>
  {
    return this.userRepository.findOne({
        where: { nickname: nick }
      })
      .then((resolve: User) =>
      {
        if (resolve)
        {
          return true;
        } else
        {
          return false;
        }
      })
      .catch(() =>
      {
        throw new UnprocessableEntityException();
      });
  }

  async saveData (userData: UserDto): Promise<User>
  {
    const user: User = await this.userRepository.findOne({
      where: { ft_id: userData.ft_id },
      relations: {
        achievementBoxes: true,
        twoFactorAuth: true
      }
    });
    if (!user)
    {
      userData.achievementBoxes = [];
      const tfa: TwoFactorAuth | void = await this.tfaService.createOne();
      if (tfa)
      {
        userData.twoFactorAuth = tfa;
      }
      const newUser: User = this.userRepository.create(userData);
      return this.userRepository.save(newUser)
        .then((resolve: User) =>
        {
          return resolve;
        })
        .catch(() =>
        {
          throw new UnprocessableEntityException();
        });
    } else
    {
      return user;
    }
  }

  async clear (): Promise<void>
  {
    const userArr: User[] = await this.userRepository.find();

    if (userArr)
    {
      userArr.map((user) =>
      {
        this.userRepository.remove(user)
          .then((resolve: User) =>
          {
            return resolve;
          })
          .catch(() =>
          {
            throw new UnprocessableEntityException();
          });
      });
    }
  }

  async clearAchBox (): Promise<void>
  {
    const userArr: User[] = await this.userRepository.find();
    userArr.map((user) =>
    {
      if (user.achievementBoxes)
      {
        user.achievementBoxes.map((achBox: AchievementBox) =>
        {
          this.achBoxService.removeOne(achBox);
        });
      }
      user.achievementBoxes = null;
      this.save(user);
    });
  }

  /*
  ** Relation
  */

  getAllChannel (user: UserEntity): Channel[]
  {
    return user.channels;
  }

  getChannelByName (user: UserEntity, chanName: string): Channel
  {
    return user.channels.find(channel => channel.name === chanName);
  }

  async addChannel (user: UserEntity, channel: Channel): Promise<User>
  {
    if (!user.channels)
    {
      user.channels = [];
    }
    user.channels.push(channel);
    return this.userRepository.save(user)
      .then((resolve: User) =>
      {
        return resolve;
      })
      .catch(() =>
      {
        throw new UnprocessableEntityException();
      });
  }

  async getMatchs (userName: string): Promise<Match[]>
  {
    return this.userRepository.findOne({
        where: {
          nickname: userName
        },
        relations: {
          matchs: true
        }
      })
      .then((resolve) =>
      {
        return resolve.matchs;
      })
      .catch(() =>
      {
        throw new UnprocessableEntityException();
      });
  }

  async addMatch (user: User, match: Match): Promise<User>
  {
    if (!user || !match)
    {
      return undefined;
    }
    user.elo += match.elo;
    if (match.isWinner)
    {
      user.nbWin += 1;
    } else
    {
      user.nbLoose += 1;
    }
    user.matchs.push(match);
    return this.userRepository.save(user)
      .then((resolve: User) =>
      {
        return resolve;
      })
      .catch(() =>
      {
        throw new UnprocessableEntityException();
      });
  }

  /*
  ** Friend List
  */

  getAllFriends (user: UserEntity): Friend[]
  {
    return (user.friends);
  }

  async addFriend (user: User, friend: Friend): Promise<User>
  {
    if (!user.friends)
    {
      user.friends = [];
    }
    user.friends.push(friend);
    return await this.save(user);
  }

  async removeFriend (user: User, friend: Friend): Promise<Friend>
  {
    if (!friend)
    {
      return undefined;
    }
    return await this.friendService.removeOne(friend);
  }

  checkFriendship (user: User, friendId: number): Friend
  {
    return (user.friends.find((element: Friend) =>
    {
      return (friendId === element.friendId);
    }));
  }

  async updateUser (nickname: string, newName: string): Promise<User | undefined>
  {
    if (!newName)
      return undefined;
    const user: User = await this.userRepository.findOne({
      where: {
        nickname: nickname
      }
    });
    if (!user)
      return undefined;
    user.nickname = newName;
    return (await this.userRepository.save(user));
  }

  async block (user: User, block: Block | void): Promise<User>
  {
    if (block)
    {
      user.blockList.push(block);
    }
    return (this.userRepository.save(user)
        .then((resolve: User) =>
        {
          return (resolve);
        })
    );
  }

  async unblock (user: User, target: User): Promise<User>
  {
    user.blockList.filter((value: Block) =>
    {
      return (value.targetId !== target.id);
    });
    return (await this.userRepository.save(user));
  }

  isBlocked (user: User, target: User): boolean
  {
    return (user.blockList.find((element: Block) =>
    {
      return (element.targetId === target.id);
    }) === undefined ? false : true);
  }
}