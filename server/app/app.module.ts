import { AuthenticationController } from '@app/controllers/authentication/authentication.controller';
import { GameController } from '@app/controllers/game/game.controller';
import { MatchController } from '@app/controllers/match/match.controller';
import { QuestionController } from '@app/controllers/question/question.controller';
import { MatchGateway } from '@app/gateways/match/match.gateway';
import { Game, gameSchema } from '@app/model/database/game';
import { Question, questionSchema } from '@app/model/database/question';
import { AuthenticationService } from '@app/services/authentication/authentication.service';
import { GameCreationService } from '@app/services/game-creation/game-creation.service';
import { GameValidationService } from '@app/services/game-validation/game-validation.service';
import { GameService } from '@app/services/game/game.service';
import { MatchBackupService } from '@app/services/match-backup/match-backup.service';
import { QuestionService } from '@app/services/question/question.service';
import { Logger, Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { BackupController } from './controllers/backup/backup.controller';
import { MatchRoomService } from './services/match-room/match-room.service';
import { PlayerRoomService } from './services/player-room/player-room.service';
import { TimeService } from './services/time/time.service';
import { ChatService } from './services/chat/chat.service';
import { AnswerGateway } from './gateways/answer/answer.gateway';
import { AnswerService } from './services/answer/answer.service';
import { HistogramService } from './services/histogram/histogram.service';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (config: ConfigService) => ({
                uri: config.get<string>('DATABASE_CONNECTION_STRING'),
            }),
        }),
        MongooseModule.forFeature([{ name: Game.name, schema: gameSchema }]),
        MongooseModule.forFeature([{ name: Question.name, schema: questionSchema }]),
        EventEmitterModule.forRoot(),
    ],
    controllers: [QuestionController, GameController, MatchController, AuthenticationController, BackupController],
    providers: [
        MatchGateway,
        Logger,
        QuestionService,
        GameService,
        GameValidationService,
        MatchBackupService,
        AuthenticationService,
        GameCreationService,
        MatchRoomService,
        TimeService,
        PlayerRoomService,
        ChatService,
        AnswerGateway,
        AnswerService,
        HistogramService,
    ],
})
export class AppModule {}
