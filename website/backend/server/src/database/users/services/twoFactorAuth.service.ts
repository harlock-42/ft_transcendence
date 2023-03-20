import { Injectable, UnprocessableEntityException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../entities/users.entity";
import { TwoFactorAuthDto } from "../dtos/TwoFactorAuth.dto";
import { TwoFactorAuth } from "../entities/twoFactorAuth.entity";
import * as speakeasy from "speakeasy";
import * as qrcode from "qrcode";
import { UserDto } from "../dtos/user.dto";
import { TfaData } from "../interfaces/tfaData.interface";

@Injectable()
export class TwoFactorAuthService
{
  constructor (
    @InjectRepository(TwoFactorAuth)
    private tfaRepository: Repository<TwoFactorAuth>
  )
  {
  }

  async save (tfa: TwoFactorAuthDto): Promise<TwoFactorAuth | void>
  {
    return this.tfaRepository.save(tfa)
      .then((resolve: TwoFactorAuth) =>
      {
        return resolve;
      })
      .catch(() =>
      {
        throw new UnprocessableEntityException();
      });
  }

  async findOne (id: number): Promise<TwoFactorAuth | void>
  {
    return this.tfaRepository.findOne({
        where: {
          id: id
        }
      })
      .then((resolve: TwoFactorAuth) =>
      {
        return resolve;
      })
      .catch(() =>
      {
        throw new UnprocessableEntityException();
      });
  }

  async findAll ()
  {
    return await this.tfaRepository.find();
  }

  async createOne (): Promise<TwoFactorAuth | void>
  {
    const newTfa = this.tfaRepository.create();
    return this.save(newTfa);
  }

  async clear ()
  {
    const tfaArr = await this.findAll();
    tfaArr.map((tfa) =>
    {
      this.tfaRepository.remove(tfa);
    });
  }

  async qrcode (): Promise<TfaData>
  {
    var secret: speakeasy.GeneratedSecret = speakeasy.generateSecret({
      name: "ft_transcendance"
    });
    return {
      qrcodeUrl: await qrcode.toDataURL(secret.otpauth_url),
      secret: secret.ascii
    };
  }

  async saveSecret (user: UserDto, secret: string): Promise<TwoFactorAuth | void>
  {
    const tfa = await this.findOne(user.twoFactorAuth.id);
    if (tfa)
    {
      tfa.secret = secret;
      return await this.save(tfa);
    }
    return null;
  }

  async activate (user: User): Promise<TwoFactorAuth | void>
  {
    const tfa = await this.findOne(user.twoFactorAuth.id);
    if (tfa)
    {
      tfa.activate = true;
      return await this.save(tfa);
    }
    return null;
  }

  async unActivate (user: User): Promise<TwoFactorAuth | void>
  {
    const tfa = await this.findOne(user.twoFactorAuth.id);
    if (tfa)
    {
      tfa.activate = false;
      return await this.save(tfa);
    }
    return null;
  }

  async checkCode (user: User, token: string): Promise<boolean>
  {
    const secretbis: string = user.twoFactorAuth.secret;
    if (!secretbis)
    {
      return false;
    }
    return speakeasy.totp.verify({
      secret: secretbis,
      encoding: "ascii",
      token: token
    });
  }

}