import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';

@Controller('/login')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('/')
    signIn(@Body() signInDto: Record<string, string>, @Res() response: Response) {
        if (this.authService.isValidPassword(signInDto.password)) {
            response.status(HttpStatus.OK).send();
        } else {
            response.status(HttpStatus.UNAUTHORIZED).send();
        }
    }
}
