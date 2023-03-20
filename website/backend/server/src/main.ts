import { INestApplication, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { AchievementService } from "./database/achievement/achievement.service";
import * as achievements from "../achievements/achievements.json";
import { AchievementBoxService } from "./database/achievementBox/achievementBox.service";

async function initDbData(app: INestApplication) {
    const achievementService: AchievementService = app.get(AchievementService);
    const achievementBoxService: AchievementBoxService = app.get(AchievementBoxService);

    if (!(await achievementService.compareAll(achievements))) {
        await achievementService.clearAchievementBox();
        await achievementService.clear();
        await achievementBoxService.clear();
        await achievementService.createMany(achievements);
    }

}

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const configService: ConfigService = app.get(ConfigService);

    initDbData(app);

    app.enableCors({
        origin: "http://localhost:3001",
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
        credentials: true
    });
    app.useGlobalPipes(new ValidationPipe());
    await app.listen(configService.get("port"));
}

bootstrap();
