import { AuthService } from '@app/services/authentication/auth.service';
import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { Response } from 'express';

interface authentificationInfo {
    password: string;
}

@Controller('/login')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('/')
    signIn(@Body() signInInfo: authentificationInfo, @Res() response: Response) {
        if (this.authService.isValidPassword(signInInfo.password)) {
            response.status(HttpStatus.OK).send();
        } else {
            response.status(HttpStatus.UNAUTHORIZED).send();
        }
    }
}
