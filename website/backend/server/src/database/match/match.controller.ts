import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Post,
  UnprocessableEntityException,
  UseFilters
} from "@nestjs/common";
import { MatchService } from "./match.service";

@Controller("match")
export class MatchController
{
  constructor (
    private matchService: MatchService
  )
  {
  }

//   @Get("")
//   async getAll ()
//   {
//     try
//     {
//       return await this.matchService.getAll();
//     } catch (error)
//     {
//       if (error instanceof UnprocessableEntityException)
//       {
//         throw error;
//       } else
//       {
//         throw new BadRequestException();
//       }
//     }
//   }

  // TODO DELETE
//   @Delete("")
//   async clear ()
//   {
//     return this.matchService.clear();
//   }
}