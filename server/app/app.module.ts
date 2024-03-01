import { AuthenticationController } from '@app/controllers/authentication/authentication.controller';
import { GameController } from '@app/controllers/game/game.controller';
import { MatchController } from '@app/controllers/match/match.controller';
import { QuestionController } from '@app/controllers/question/question.controller';
import { Game, gameSchema } from '@app/model/database/game';
import { Question, questionSchema } from '@app/model/database/question';
import { AuthenticationService } from '@app/services/authentication/authentication.service';
import { GameValidationService } from '@app/services/game-validation/game-validation.service';
import { GameService } from '@app/services/game/game.service';
import { MatchService } from '@app/services/match/match.service';
import { QuestionService } from '@app/services/question/question.service';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MatchGateway } from './gateways/match/match.gateway';
import { GameCreationService } from './services/game-creation/game-creation.service';

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
    controllers: [QuestionController, GameController, MatchController, AuthenticationController],
    providers: [Logger, QuestionService, GameService, GameValidationService, MatchService, AuthenticationService, GameCreationService, MatchGateway],
})
export class AppModule {}
