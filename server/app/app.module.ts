import { Logger, Module } from '@nestjs/common';
// import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
// import { ConfigModule, ConfigService } from '@nestjs/config';
// import { Course, courseSchema } from '@app/model/database/course';
// import { CourseController } from '@app/controllers/course/course.controller';
// import { CourseService } from '@app/services/course/course.service';
import { GamesController } from '@app/controllers/admin/games/games.controller';
import { DateController } from '@app/controllers/date/date.controller';
import { ExampleController } from '@app/controllers/example/example.controller';
import { QuestionController } from './controllers/question/question.controller';
import { QuestionService } from './services/question/question.service';
import { ChatGateway } from '@app/gateways/chat/chat.gateway';
import { GamesService } from '@app/services/admin/games/games.service';
import { DateService } from '@app/services/date/date.service';
import { ExampleService } from '@app/services/example/example.service';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        // MongooseModule.forRootAsync({
        //     imports: [ConfigModule],
        //     inject: [ConfigService],
        //     useFactory: async (config: ConfigService) => ({
        //         uri: config.get<string>('DATABASE_CONNECTION_STRING'), // Loaded from .env
        //     }),
        // }),
        // MongooseModule.forFeature([{ name: Course.name, schema: courseSchema }]),
    ],
    // controllers: [CourseController, DateController, ExampleController],
    // providers: [ChatGateway, CourseService, DateService, ExampleService, Logger],
    controllers: [DateController, ExampleController, QuestionController, GamesController],
    providers: [ChatGateway, DateService, ExampleService, Logger, QuestionService, GamesService],
})
export class AppModule {}
