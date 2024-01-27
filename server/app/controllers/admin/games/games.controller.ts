import { CreateGameDto } from '@app/model/dto/create-game.dto';
import { GamesService } from '@app/services/admin/games/games.service';
import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('games')
@Controller('admin/games')
export class GamesController {
    constructor(private readonly gamesService: GamesService) {}

    @Get('/')
    async allGames(@Res() response: Response) {
        try {
            const allGames = await this.gamesService.getAllGames();
            response.status(HttpStatus.OK).json(allGames);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @Get('/:id')
    async gameById(@Param('id') id: string, @Res() response: Response) {
        try {
            const game = await this.gamesService.getGameById(parseInt(id));
            response.status(HttpStatus.OK).json(game);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @Post('/json')
    async addGameFromJson(@Body() createGameDto: CreateGameDto, @Res() response: Response) {
        try {
            const newGame = await this.gamesService.addGameFromJson(createGameDto);
            response.status(HttpStatus.CREATED).send(JSON.stringify(newGame));
        } catch (error) {
            response.status(HttpStatus.BAD_REQUEST).send(error.message);
        }
    }

    @Patch('/:id')
    async toggleGameVisibility(@Param('id') id: string, @Res() response: Response) {
        try {
            // TODO: Dto ?
            await this.gamesService.toggleGameVisibility(parseInt(id));
            response.status(HttpStatus.OK).send();
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @Delete('/:id')
    async deleteGame(@Param('id') id: string, @Res() response: Response) {
        try {
            await this.gamesService.deleteGame(parseInt(id));
            response.status(HttpStatus.NO_CONTENT).send();
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }
}
