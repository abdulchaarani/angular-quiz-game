import { MatchService } from '@app/services/match/match.service';
import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Res } from '@nestjs/common';
import { Response } from 'express';

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
    async allChoices(@Param('gameId') gameId: string, @Param('questionId') questionId: string, @Res() response: Response) {
        try {
            const choices = await this.matchService.getChoices(gameId, questionId);
            response.status(HttpStatus.OK).json(choices);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send({ message: error.message });
        }
    }

    // TODO: Add DTO for Body which would contain a list of choices
    @Post('/backups/:gameId/questions/:questionId/validate-choice')
    async validatePlayerChoice(
        @Param('gameId') gameId: string,
        @Param('questionId') questionId: string,
        @Body() choicesDto: Record<string, string[]>,
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
    async getBackupGame(@Param('gameId') gameId: string, @Res() response: Response) {
        try {
            const backupGame = await this.matchService.getBackupGame(gameId);
            response.status(HttpStatus.OK).json(backupGame);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send({ message: error.message });
        }
    }

    @Post('/backups/:gameId')
    async saveBackupGame(@Param('gameId') gameId: string, @Res() response: Response) {
        console.log("POST")
        try {
            const game = await this.matchService.saveBackupGame(gameId);
            response.status(HttpStatus.CREATED).json(game);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send({ message: error.message });
        }
    }

    @Delete('/backups/:gameId')
    async deleteBackupGame(@Param('gameId') gameId: string, @Res() response: Response) {
        try {
            await this.matchService.deleteBackupGame(gameId);
            response.status(HttpStatus.NO_CONTENT).send();
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send({ message: error.message });
        }
    }
}
