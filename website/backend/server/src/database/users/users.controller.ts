import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Param,
  NotFoundException,
  Delete,
  Put,
  HttpException,
  HttpStatus,
  UseFilters,
  UseInterceptors,
  UploadedFile,
  Redirect,
  Req,
  ParseIntPipe,
  Res,
  UnauthorizedException,
  UnprocessableEntityException,
  BadRequestException,
  ParseFilePipe,
  FileTypeValidator,
  ImATeapotException,
  MaxFileSizeValidator
}
  from "@nestjs/common";
import { JwtAuthGuard } from "src/Auth/auth.guards";
import { Public } from "src/Auth/public.decorator";
import { IsNickNotInUse } from "./guards/user.guard";
import { UsersService } from "./services/users.service";
import { GqlAuthGuard } from "src/Auth/auth.guards";
import { RelationsUserDto } from "./dtos/relationsUser.dto";
import { CurrentUser } from "src/Auth/currentUser.decorator";
import { FileInterceptor } from "@nestjs/platform-express";
import { User } from "./entities/users.entity";
import { RegisterDto } from "./dtos/register.dto";
import { SettingMeDto } from "./dtos/settingMe.dto";
import { diskStorage } from "multer";
import { TwoFactorAuthService } from "./services/twoFactorAuth.service";
import { TfaData } from "./interfaces/tfaData.interface";
import { QrcodeInterface } from "./interfaces/qrcode.interface";
import { TwoFactorAuth } from "./entities/twoFactorAuth.entity";
import { ActivateInterface } from "./interfaces/activate.interface";
import { CodeDto } from "./dtos/code.dto";
import { CurrentUserInterface } from "./interfaces/currentUser.interface";
import { NicknameDto } from "./dtos/nickname.dto";
import { NicknameInterface } from "./interfaces/nickname.interface";
import { NoSchemaIntrospectionCustomRule } from "graphql";
import { AchievementService } from "../achievement/achievement.service";
import { plainToClass } from "class-transformer";
import { SerializedUser } from "./serializers/user.serializer";

@Controller("users")
export class UsersController
{
  constructor (
    private userService: UsersService,
    private tfaService: TwoFactorAuthService
  )
  {}

	@UseGuards(JwtAuthGuard)
	@Get('ranking')
	async ranking(): Promise<User[] | void[]> {
		try {
			let users = await this.userService.ranking()
			// const newUsers = users.map((user) => {
			// 	plainToClass(SerializedUser, user)
			// })
			// console.log(newUsers)
			// console.log(users)
			return users
		} catch (error) {
			if (error instanceof UnprocessableEntityException) {
				throw error
			} else {
				throw new BadRequestException()
			}
		}
	}

  @Public()
  @Get("")
  getUsers (@Body() body: RelationsUserDto): Promise<User[]>
  {
    try
    {
      return this.userService.getAll(body);
    } catch (error)
    {
      if (error instanceof UnprocessableEntityException)
      {
        throw error;
      } else
      {
        throw new BadRequestException();
      }
    }
  }

  @UseGuards(GqlAuthGuard)
  @Get("checkToken")
  async getGqlUser (@CurrentUser() user: CurrentUserInterface)
  {
    try
    {
      const target = await this.userService.findOne(user.userId);
      if (!target)
      {
        throw new NotFoundException();
      }
    } catch (error)
    {
      if (
        error instanceof UnprocessableEntityException
        || error instanceof NotFoundException
      )
      {
        throw error;
      } else
      {
        throw new BadRequestException();
      }
    }
  }

  @UseGuards(GqlAuthGuard)
  @Get("me/nickname")
  async getNickname (
    @CurrentUser() user: CurrentUserInterface
  ): Promise<NicknameInterface>
  {
    try
    {
      return { nickname: await this.userService.getNickname(user.userId) };
    } catch (error)
    {
      if (error instanceof NotFoundException)
      {
        throw error;
      } else
      {
        throw new BadRequestException();
      }
    }
  }

  @UseGuards(GqlAuthGuard)
  @Get("tfa/qrcode")
  async qrcode (@CurrentUser() user: CurrentUserInterface): Promise<QrcodeInterface>
  {
    try
    {
      const tfaData: TfaData = await this.tfaService.qrcode();
      const target: User | undefined = await this.userService.getOneById(user.userId);
      if (!target)
      {
        throw new NotFoundException();
      }
      await this.tfaService.saveSecret(target, tfaData.secret);
      return {
        qrcodeUrl: tfaData.qrcodeUrl
      };
    } catch (error)
    {
      if (
        error instanceof NotFoundException
        || error instanceof UnprocessableEntityException
      )
      {
        throw error;
      } else
      {
        throw new BadRequestException();
      }
    }
  }

  @UseGuards(GqlAuthGuard)
  @Put("tfa/activate")
  async tfaActivate (@CurrentUser() user: CurrentUserInterface): Promise<TwoFactorAuth | void>
  {

    try
    {
      const target: User | undefined = await this.userService.getOneById(user.userId);
      if (!target)
      {
        throw new NotFoundException();
      }
      return await this.tfaService.activate(target);

    } catch (error)
    {
      if (
        error instanceof NotFoundException
        || error instanceof UnprocessableEntityException
      )
      {
        throw error;
      } else
      {
        throw new BadRequestException();
      }
    }
  }

  @UseGuards(GqlAuthGuard)
  @Put("tfa/unActivate")
  async tfaUnActivate (@CurrentUser() user: CurrentUserInterface): Promise<TwoFactorAuth | void>
  {
    try
    {
      const target: User | undefined = await this.userService.getOneById(user.userId);
      if (!target)
      {
        throw new NotFoundException();
      }
      return await this.tfaService.unActivate(target);
    } catch (error)
    {
      if (
        error instanceof NotFoundException
        || error instanceof UnprocessableEntityException
      )
      {
        throw error;
      } else
      {
        throw new BadRequestException();
      }
    }
  }

  @UseGuards(GqlAuthGuard)
  @Get("tfa/isActivate")
  async tfaIsActivate (@CurrentUser() user: CurrentUserInterface): Promise<ActivateInterface>
  {

    try
    {
      const target: User | undefined = await this.userService.getOneById(user.userId);
      if (!target)
      {
        throw new NotFoundException();
      }
      return {
        activate: target.twoFactorAuth.activate
      };

    } catch (error)
    {
      if (
        error instanceof NotFoundException
      )
      {
        throw error;
      } else
      {
        throw new BadRequestException();
      }
    }
  }

  @UseGuards(GqlAuthGuard)
  @Post("tfa/checkCode")
  async tfaCheckCode (@CurrentUser() user: CurrentUserInterface, @Body() body: CodeDto): Promise<boolean>
  {
    try
    {
      const target: User | undefined = await this.userService.getOneById(user.userId);
      if (!target)
      {
        throw new NotFoundException();
      }
      return await this.tfaService.checkCode(target, body.code);

    } catch (error)
    {
      if (
        error instanceof NotFoundException
      )
      {
        throw error;
      } else
      {
        throw new BadRequestException();
      }
    }
  }

  @UseGuards(GqlAuthGuard)
  @Post("photo/me")
  @UseInterceptors(FileInterceptor("file", {
    storage: diskStorage({
      destination: "./uploads/"
    })
  }))
  async savePhotoMe (
    @CurrentUser() user: CurrentUserInterface,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: /.(jpg|jpeg|png|gif)$/ }),
		  new MaxFileSizeValidator({ maxSize: 10000000})
        ]
      })
    ) file: Express.Multer.File
  )
  {
    try
    {
      if (file)
      {
        return {
          imgName: (await this.userService.saveImg(user.userId, file.filename)).imgUrl
        };
      }
    } catch (error)
    {
      if (
        error instanceof NotFoundException
        || error instanceof UnprocessableEntityException
      )
      {
        throw error;
      } else
      {
        throw new BadRequestException();
      }
    }
  }

  @UseGuards(GqlAuthGuard)
  @Post("nickname/me")
  async saveNicknameMe (
    @CurrentUser() user: CurrentUserInterface,
    @Body() body: SettingMeDto
  )
  {
    try
    {
      const target = await this.userService.findOne(user.userId);
      if (!target)
      {
        throw new NotFoundException();
      }
      if (body.nickname)
      {
        const checkNickanme = await this.userService.getOneByNickname(body.nickname);
        if (checkNickanme)
        {
          throw new ImATeapotException();
        }
        this.userService.setNickname(user.userId, body.nickname);

      }
    } catch (error)
    {
      if (
        error instanceof NotFoundException
        || error instanceof UnprocessableEntityException
        || error instanceof ImATeapotException
      )
      {
        throw error;
      } else
      {
        throw new BadRequestException();
      }
    }
  }

//   @UseGuards(JwtAuthGuard)
  @Get("img/:imgUrl")
  async getImg (@Param("imgUrl") imgUrl: string, @Res() res: any): Promise<any>
  {
    try
    {
      res.sendFile(imgUrl, {
        root: "./uploads"
      });
    } catch (error)
    {
      if (
        error instanceof NotFoundException
      )
      {
        throw error;
      } else
      {
        throw new BadRequestException();
      }
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get("profil/:nickname")
  async getProfilByNickname (@Param() params: NicknameDto): Promise<User>
  {
    try
    {
      const user: User | undefined = await this.userService.getProfilByNickname(params.nickname);
      return user
    } catch (error)
    {
      if (
        error instanceof NotFoundException
        || error instanceof UnprocessableEntityException
      )
      {
        throw error;
      } else
      {
        throw new BadRequestException();
      }
    }
  }

  @Post("register")
  async register (@Body() body: RegisterDto): Promise<User>
  {
    const user = await this.userService.getOneByNickname(body.nickname);
    if (user)
    {
      return user;
    }
    return await this.userService.register(body);
  }
}