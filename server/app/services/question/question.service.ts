import { QUESTIONS_TO_POPULATE } from '@app/constants/populate-constants';
import { Question, QuestionDocument } from '@app/model/database/question';
import { CreateQuestionDto } from '@app/model/dto/question/create-question-dto';
import { UpdateQuestionDto } from '@app/model/dto/question/update-question-dto';
import { GameValidationService } from '@app/services/game-validation/game-validation.service';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

// TODO: Add Validation Service
@Injectable()
export class QuestionService {
    constructor(
        @InjectModel(Question.name) public questionModel: Model<QuestionDocument>,
        private readonly logger: Logger,
        private validation: GameValidationService,
    ) {
        this.start();
    }

    async start() {
        if ((await this.questionModel.countDocuments()) === 0) {
            await this.populateDB();
        }
    }

    async populateDB(): Promise<void> {
        this.logger.log('THIS ADDS DATA TO THE DATABASE, DO NOT USE OTHERWISE');
        await this.questionModel.insertMany(QUESTIONS_TO_POPULATE);
    }

    async getAllQuestions(): Promise<Question[]> {
        return await this.questionModel.find({});
    }

    //
    async getQuestionByName(name: string): Promise<Question> {
        return await this.questionModel.findOne({ question: name });
    }

    async getQuestionById(questionId: string): Promise<Question> {
        return await this.questionModel.findOne({ id: questionId });
    }

    async addQuestion(question: CreateQuestionDto): Promise<void> {
        // TODO: Unit-test for when a question already exists
        if (await this.getQuestionByName(question.text)) {
            return Promise.reject('La question existe déjà dans la banque.');
        }
        question.id = uuidv4();
        question.lastModification = new Date();
        const errorMessages = this.validation.findQuestionErrors(question);
        if (errorMessages.length !== 0) {
            return Promise.reject(`La question est invalide:\n${errorMessages}`);
        }
        try {
            await this.questionModel.create(question);
        } catch (error) {
            return Promise.reject(`La question n'a pas pu être ajoutée.: ${error}`);
        }
    }

    async updateQuestion(question: UpdateQuestionDto): Promise<void> {
        const filterQuery = { id: question.id };
        try {
            question.lastModification = new Date();
            const errorMessages = this.validation.findQuestionErrors(question);
            if (errorMessages.length !== 0) {
                return Promise.reject(`La question est invalide:\n${errorMessages}`);
            }
            const res = await this.questionModel.updateOne(filterQuery, question);
            if (res.matchedCount === 0) {
                return Promise.reject('La question est introuvable.');
            }
        } catch (error) {
            return Promise.reject(`La question n'a pas été mise à jour: ${error}`);
        }
    }

    async deleteQuestion(questionId: string): Promise<void> {
        try {
            const res = await this.questionModel.deleteOne({
                id: questionId,
            });
            if (res.deletedCount === 0) {
                return Promise.reject('La question est introuvable.');
            }
        } catch (error) {
            return Promise.reject(`La question n'a pas pu être supprimée: ${error}`);
        }
    }
}
