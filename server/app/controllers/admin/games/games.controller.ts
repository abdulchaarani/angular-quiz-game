import { Game } from '@app/model/database/game';
import { GamesService } from '@app/services/admin/games/games.service';
import { Controller, Delete, Get, HttpStatus, Param, Patch, Res } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse } from '@nestjs/swagger';
import { Response } from 'express';

// Dev note: Actual route will be: localhost/3000/api/admin/games
@Controller('admin/games')
export class GamesController {
    constructor(private readonly gamesService: GamesService) {}
    @ApiOkResponse({
        description: 'Returns all games',
        type: Game,
        isArray: true,
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Get('/')
    async allGames(@Res() response: Response) {
        try {
            const allGames = this.gamesService.getAllGames();
            response.status(HttpStatus.OK).json(allGames);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @ApiOkResponse({
        description: 'Returns a specific game by its id',
        type: Game,
        isArray: true,
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Get('/:id')
    async gameById(@Param('id') id: string, @Res() response: Response) {
        try {
            const game = this.gamesService.getGameById(parseInt(id));
            response.status(HttpStatus.OK).json(game);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @Patch('/:id')
    async toggleGameVisibility(@Param('id') id: string, @Res() response: Response) {
        try {
            // TODO: Dto ?
            this.gamesService.toggleGameVisibility(parseInt(id));
            response.status(HttpStatus.OK).send();
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @Delete('/:id')
    async deleteGame(@Param('id') id: string, @Res() response: Response) {
        try {
            this.gamesService.deleteGame(parseInt(id));
            response.status(HttpStatus.NO_CONTENT).send();
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }
}
