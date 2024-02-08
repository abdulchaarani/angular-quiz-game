import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { UpdateGameDto } from '@app/model/dto/game/update-game.dto';
import { CreateQuestionDto } from '@app/model/dto/question/create-question-dto';
import { GameService } from '@app/services/game/game.service';
import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Put, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('games')
@Controller('admin/games')
export class GameController {
    constructor(private readonly gameService: GameService) {}

    // TODO: Return types
    @Get('/')
    async allGames(@Res() response: Response) {
        try {
            const allGames = await this.gameService.getAllGames();
            response.status(HttpStatus.OK).json(allGames);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @Get('/:id')
    async gameById(@Param('id') id: string, @Res() response: Response) {
        try {
            const game = await this.gameService.getGameById(id);
            response.status(HttpStatus.OK).json(game);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error);
        }
    }

    @Post('/')
    async addGame(@Body() createGameDto: CreateGameDto, @Res() response: Response) {
        try {
            const newGame = await this.gameService.addGame(createGameDto);
            response.status(HttpStatus.CREATED).send(JSON.stringify(newGame));
        } catch (error) {
            response.status(HttpStatus.BAD_REQUEST).send(error);
        }
    }

    // TODO: Unit test
    @Post('/validate-question/')
    async validateQuestion(@Body() createQuestionDto: CreateQuestionDto, @Res() response: Response) {
        try {
            const questionToValidate = await this.gameService.validateQuestion(createQuestionDto);
            response.status(HttpStatus.OK).send(JSON.stringify(questionToValidate));
        } catch (error) {
            response.status(HttpStatus.BAD_REQUEST).send(error);
        }
    }

    // Toggle Visibility doesn't change date
    @Patch('/:id')
    async toggleGameVisibility(@Param('id') id: string, @Res() response: Response) {
        try {
            await this.gameService.toggleGameVisibility(id);
            response.status(HttpStatus.OK).send();
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @Put('/:id')
    async upsertGame(@Body() updateGameDto: UpdateGameDto, @Res() response: Response) {
        try {
            await this.gameService.upsertGame(updateGameDto);
            response.status(HttpStatus.OK).send();
        } catch (error) {
            response.status(HttpStatus.BAD_REQUEST).send(error.message);
        }
    }

    @Delete('/:id')
    async deleteGame(@Param('id') id: string, @Res() response: Response) {
        try {
            await this.gameService.deleteGame(id);
            response.status(HttpStatus.NO_CONTENT).send();
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }
}
