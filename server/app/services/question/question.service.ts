import { Question, QuestionDocument } from '@app/model/database/question';
import { CreateQuestionDto } from '@app/model/dto/question/create-question-dto';
import { UpdateQuestionDto } from '@app/model/dto/question/update-question-dto';
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
                id: '1',
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
                lastModification: new Date(2024, 1, 2),
            },
            {
                id: '2',
                type: 'QCM',
                description: 'Inspiration Leblanc',
                question: "Savez-vous de quel auteur Leblanc s'est inspiré ?",
                points: 60,
                choices: [
                    {
                        text: 'Gaston Leroux',
                        isCorrect: false,
                    },
                    {
                        text: 'Arthur Conan Doyle',
                        isCorrect: true,
                    },
                    {
                        text: 'Edgar Wallace',
                        isCorrect: false,
                    },
                    {
                        text: 'Agatha Christie',
                        isCorrect: false,
                    },
                ],
                lastModification: new Date(2024, 1, 2),
            },
            {
                id: '3',
                type: 'QCM',
                description: 'Outer Wilds',
                question: 'Parmi les choix suivants, lesquels sont des noms de planètes dans Outer Wilds ?',
                points: 20,
                choices: [
                    {
                        text: 'Sombronces',
                        isCorrect: true,
                    },
                    {
                        text: 'Léviathe',
                        isCorrect: true,
                    },
                    {
                        text: 'Cravité',
                        isCorrect: true,
                    },
                    {
                        text: 'La Lanterne',
                        isCorrect: false,
                    },
                ],
                lastModification: new Date(2024, 1, 1),
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

    async getQuestionById(questionId: string): Promise<Question> {
        return await this.questionModel.findOne({ id: questionId });
    }

    // TODO: validate question input
    async addQuestion(question: CreateQuestionDto): Promise<void> {
        question.id = uuidv4();
        try {
            await this.questionModel.create(question);
        } catch (error) {
            return Promise.reject(`Failed to insert question: ${error}`);
        }
    }

    async modifyQuestion(question: UpdateQuestionDto): Promise<void> {
        const filterQuery = { id: question.id };
        try {
            const res = await this.questionModel.updateOne(filterQuery, question);
            if (res.matchedCount === 0) {
                return Promise.reject('Could not find question');
            }
        } catch (error) {
            return Promise.reject(`Failed to modify document: ${error}`);
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
