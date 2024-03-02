import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { MatchService } from '@app/services/match/match.service';
import { Body, Controller, Get, HttpStatus, Param, Post, Res } from '@nestjs/common';
import { Response } from 'express';

interface MatchRoomCodeInfo {
    matchRoomCode: string;
}

interface MatchUsernameInfo {
    matchRoomCode: string;
    username: string;
}

@Controller('match')
export class MatchController {
    constructor(
        private readonly matchService: MatchService,
        private matchRoomService: MatchRoomService,
    ) {}

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

    @Post('validate-code')
    validateMatchRoomCode(@Body() data: MatchRoomCodeInfo, @Res() response: Response) {
        if (this.matchRoomService.isValidMatchRoomCode(data.matchRoomCode)) {
            response.status(HttpStatus.OK).send();
        } else {
            response.status(HttpStatus.FORBIDDEN).send();
        }
    }

    @Post('validate-username')
    validateUsername(@Body() data: MatchUsernameInfo, @Res() response: Response) {
        if (this.matchRoomService.isValidUsername(data.matchRoomCode, data.username)) {
            response.status(HttpStatus.OK).send();
        } else {
            response.status(HttpStatus.FORBIDDEN).send();
        }
    }
}
