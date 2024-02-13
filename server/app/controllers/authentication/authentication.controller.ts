import { AuthenticationService } from '@app/services/authentication/authentication.service';
import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { Response } from 'express';

interface authentificationInfo {
    password: string;
}

@Controller('/login')
export class AuthenticationController {
    constructor(private authService: AuthenticationService) {}

    @Post('/')
    signIn(@Body() signInInfo: authentificationInfo, @Res() response: Response) {
        if (this.authService.isValidPassword(signInInfo.password)) {
            response.status(HttpStatus.OK).send();
        } else {
            response.status(HttpStatus.UNAUTHORIZED).send();
        }
    }
}
