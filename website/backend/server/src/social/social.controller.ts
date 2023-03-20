import { BadRequestException, Controller, Get, NotFoundException, Param, Res } from "@nestjs/common";

@Controller("social")
export class SocialController {
    @Get("img/:imgUrl")
    async getImg(@Param("imgUrl") imgUrl: string, @Res() res: any) {
        try {
            return res.sendFile(imgUrl, {
                root: "./uploads/socialFiles"
            });
        } catch (error) {
            if (
                error instanceof NotFoundException
            ) {
                throw error;
            } else {
                throw new BadRequestException();
            }
        }
    }
}