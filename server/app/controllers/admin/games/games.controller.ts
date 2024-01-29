import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { UpdateGameDto } from '@app/model/dto/game/update-game.dto';
import { GamesService } from '@app/services/admin/games/games.service';
import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Put, Res } from '@nestjs/common';
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

    @Post('/')
    async addGame(@Body() createGameDto: CreateGameDto, @Res() response: Response) {
        try {
            const newGame = await this.gamesService.addGame(createGameDto);
            response.status(HttpStatus.CREATED).send(JSON.stringify(newGame));
        } catch (error) {
            response.status(HttpStatus.BAD_REQUEST).send(error.message);
        }
    }

    // TODO: If the point is to create a game if not found (and replace it if found), maybe use PUT instead?
    @Put('/:id')
    @Patch('/:id')
    async updateGame(@Body() updateGameDto: UpdateGameDto, @Res() response: Response) {
        try {
            await this.gamesService.updateGame(updateGameDto);
            response.status(HttpStatus.OK).send();
            // TODO: HttpStatus.CREATED if new game
        } catch (error) {
            response.status(HttpStatus.BAD_REQUEST).send(error.message);
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
