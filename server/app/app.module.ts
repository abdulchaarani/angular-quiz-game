import { GameController } from '@app/controllers/game/game.controller';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './controllers/authentication/auth.controller';
import { MatchController } from './controllers/match/match.controller';
import { QuestionController } from './controllers/question/question.controller';
import { Game, gameSchema } from './model/database/game';
import { Question, questionSchema } from './model/database/question';
import { AuthService } from './services/authentication/auth.service';
import { GameValidationService } from './services/game-validation/game-validation.service';
import { GameService } from './services/game/game.service';
import { MatchService } from './services/match/match.service';
import { QuestionService } from './services/question/question.service';

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
        MongooseModule.forFeature([{ name: Question.name, schema: questionSchema }]),
    ],
    controllers: [QuestionController, GameController, MatchController, AuthController],
    providers: [Logger, QuestionService, GameService, GameValidationService, MatchService, AuthService],
})
export class AppModule {}
