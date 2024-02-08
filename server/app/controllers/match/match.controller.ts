import { GameService } from '@app/services/game/game.service';
import { Body, Controller, Get, HttpStatus, Param, Post, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller('match')
export class MatchController {
    // TODO: Check Mandela effect: do we have to keep a temporary save of the game if the game is deleted while being played by someone?
    constructor(private readonly gameService: GameService) {}

    @Get('/games')
    async allVisibleGames(@Res() response: Response) {
        try {
            // TODO: Is Correct ?
            const allVisibleGames = await this.gameService.getAllVisibleGames();
            response.status(HttpStatus.OK).json(allVisibleGames);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send({ message: error });
        }
    }

    @Get('/games/:gameId')
    async gameById(@Param('gameId') gameId: string, @Res() response: Response) {
        try {
            // TODO: IsCorrect ?
            const game = await this.gameService.getGameById(gameId);
            response.status(HttpStatus.OK).json(game);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send({ message: error });
        }
    }

    @Get('/games/:gameId/questions/:questionId/choices')
    async allChoices(@Param('gameId') gameId: string, @Param('questionId') questionId: string, @Res() response: Response) {
        try {
            const choices = await this.gameService.getChoices(gameId, questionId);
            response.status(HttpStatus.OK).json(choices);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send({ message: error });
        }
    }

    // TODO: Add DTO for Body which would contain a list of choices
    @Post('/games/:gameId/questions/:questionId/validate-choice')
    async validatePlayerChoice(
        @Param('gameId') gameId: string,
        @Param('questionId') questionId: string,
        @Body() choicesDto: Record<string, string[]>,
        @Res() response: Response,
    ) {
        try {
            const isValidChoice = await this.gameService.validatePlayerChoice(gameId, questionId, choicesDto.selected);
            response.status(HttpStatus.OK).json(isValidChoice);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send({ message: error });
        }
    }
}
