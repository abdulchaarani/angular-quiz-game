import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';

@Controller('/login')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('/')
    signIn(@Body() signInDto: Record<string, any>, @Res() response: Response) {
        this.authService.signIn(signInDto.username, signInDto.password);
        if (this.authService.isValidPassword(signInDto.password)) {
            response.status(HttpStatus.OK).send();
        } else {
            response.status(HttpStatus.UNAUTHORIZED).send();
        }
    }
    // TODO: Check if we need to also forbid writing the URL directly
    // TODO: Put @UseGuards(AuthGuard) on routes/controllers to secure
    // TODO: Catch Unauthorized Exceptions
}
