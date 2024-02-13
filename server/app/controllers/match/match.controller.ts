import { ERROR_GAME_NOT_FOUND, ERROR_QUESTION_NOT_FOUND } from '@app/constants/request-errors';
import { MatchService } from '@app/services/match/match.service';
import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Res } from '@nestjs/common';
import { Response } from 'express';

interface SentChoicesText {
    selected: string[];
}

@Controller('match')
export class MatchController {
    constructor(private readonly matchService: MatchService) {}

    @Get('/games')
    async allVisibleGames(@Res() response: Response) {
        try {
            const allVisibleGames = await this.matchService.getAllVisibleGames();
            response.status(HttpStatus.OK).json(allVisibleGames);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send({ message: error.message });
        }
    }

    @Get('/games/:gameId')
    async gameByIdWithoutIsCorrect(@Param('gameId') gameId: string, @Res() response: Response) {
        try {
            const game = await this.matchService.getGameByIdWithoutIsCorrect(gameId);
            response.status(HttpStatus.OK).json(game);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send({ message: error.message });
        }
    }

    @Get('/backups/:gameId/questions/:questionId/choices')
    allChoices(@Param('gameId') gameId: string, @Param('questionId') questionId: string, @Res() response: Response) {
        const choices = this.matchService.getChoices(gameId, questionId);
        if (choices) {
            response.status(HttpStatus.OK).json(choices);
        } else {
            response.status(HttpStatus.NOT_FOUND).send({ message: ERROR_QUESTION_NOT_FOUND });
        }
    }

    @Post('/backups/:gameId/questions/:questionId/validate-choice')
    async validatePlayerChoice(
        @Param('gameId') gameId: string,
        @Param('questionId') questionId: string,
        @Body() choicesDto: SentChoicesText,
        @Res() response: Response,
    ) {
        try {
            const isValidChoice = await this.matchService.validatePlayerChoice(gameId, questionId, choicesDto.selected);
            response.status(HttpStatus.OK).json(isValidChoice);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send({ message: error.message });
        }
    }

    @Get('/backups/:gameId')
    getBackupGame(@Param('gameId') gameId: string, @Res() response: Response) {
        const backupGame = this.matchService.getBackupGame(gameId);
        if (backupGame) {
            response.status(HttpStatus.OK).json(backupGame);
        } else {
            response.status(HttpStatus.NOT_FOUND).send({ message: ERROR_GAME_NOT_FOUND });
        }
    }

    @Post('/backups/:gameId')
    async saveBackupGame(@Param('gameId') gameId: string, @Res() response: Response) {
        try {
            const game = await this.matchService.saveBackupGame(gameId);
            response.status(HttpStatus.CREATED).json(game);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send({ message: error.message });
        }
    }

    @Delete('/backups/:gameId')
    async deleteBackupGame(@Param('gameId') gameId: string, @Res() response: Response) {
        const isDeleted = this.matchService.deleteBackupGame(gameId);
        if (isDeleted) {
            response.status(HttpStatus.NO_CONTENT).send();
        } else {
            response.status(HttpStatus.NOT_FOUND).send({ message: ERROR_GAME_NOT_FOUND });
        }
    }
}
