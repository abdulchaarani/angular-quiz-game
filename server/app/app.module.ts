import { DateController } from '@app/controllers/date/date.controller';
import { ExampleController } from '@app/controllers/example/example.controller';
import { GameController } from '@app/controllers/game/game.controller';
import { ChatGateway } from '@app/gateways/chat/chat.gateway';
import { Course, courseSchema } from '@app/model/database/course';
import { DateService } from '@app/services/date/date.service';
import { ExampleService } from '@app/services/example/example.service';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { QuestionController } from './controllers/question/question.controller';
import { Game, gameSchema } from './model/database/game';
import { Question, questionSchema } from './model/database/question';
import { GameService } from './services/game/game.service';
import { QuestionService } from './services/question/question.service';
import { AuthModule } from './auth/auth.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (config: ConfigService) => ({
                uri: config.get<string>('DATABASE_CONNECTION_STRING'), // Loaded from .env
            }),
        }),
        MongooseModule.forFeature([{ name: Game.name, schema: gameSchema }]),
        MongooseModule.forFeature([{ name: Course.name, schema: courseSchema }]),
        MongooseModule.forFeature([{ name: Question.name, schema: questionSchema }]),
        AuthModule,
    ],
    controllers: [DateController, ExampleController, QuestionController, GameController],
    providers: [ChatGateway, DateService, ExampleService, Logger, QuestionService, GameService],
})
export class AppModule {}
