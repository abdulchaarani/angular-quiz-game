import { MatchService } from '@app/services/match/match.service';
import { Controller, Get, HttpStatus, Param, Res } from '@nestjs/common';
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
}
