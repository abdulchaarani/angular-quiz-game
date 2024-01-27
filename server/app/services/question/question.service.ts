import { Question, QuestionDocument } from '@app/model/database/question';
import { CreateQuestionDto } from '@app/model/dto/question/question-dto';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class QuestionService {
    constructor(
        @InjectModel(Question.name) public questionModel: Model<QuestionDocument>,
        private readonly logger: Logger,
    ) {
        this.start();
    }

    async start() {
        if ((await this.questionModel.countDocuments()) === 0) {
            await this.populateDB();
        }
    }

    async populateDB(): Promise<void> {
        const QUESTIONS: CreateQuestionDto[] = [
            {
                id: '100',
                type: 'QCM',
                description: 'Motifs sur ballon de soccer',
                question: 'Combien de motifs blancs et noirs y a-t-il respectivement sur un ballon de soccer?',
                points: 20,
                choices: [
                    {
                        text: '30 blancs, 5 noirs',
                        isCorrect: false,
                    },
                    {
                        text: '20 blancs, 12 noirs',
                        isCorrect: true,
                    },
                    {
                        text: 'Cela varie',
                        isCorrect: false,
                    },
                ],
                lastModification: '2018-11-13T20:20:39+00:00',
            },
        ];
        this.logger.log('THIS ADDS DATA TO THE DATABASE, DO NOT USE OTHERWISE');
        await this.questionModel.insertMany(QUESTIONS);
    }

    async getAllQuestions(): Promise<Question[]> {
        return await this.questionModel.find({});
    }

    async getAllMultipleChoiceQuestions(): Promise<Question[]> {
        return await this.questionModel.find({ type: 'QCM' });
    }

    // TODO: validate question input + DTO
    async addQuestion(question: CreateQuestionDto): Promise<void> {
        question.id = uuidv4();
        try {
            await this.questionModel.create(question);
        } catch (error) {
            return Promise.reject(`Failed to insert question: ${error}`);
        }
    }

    async deleteQuestion(questionId: string): Promise<void> {
        try {
            const res = await this.questionModel.deleteOne({
                id: questionId,
            });
            if (res.deletedCount === 0) {
                return Promise.reject('Could not find game');
            }
        } catch (error) {
            return Promise.reject(`Failed to delete game: ${error}`);
        }
    }
}
