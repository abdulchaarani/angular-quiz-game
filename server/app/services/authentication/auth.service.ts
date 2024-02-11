import { Injectable } from '@nestjs/common';
// import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    private readonly password = 'log2990-305';

    isValidPassword(password: string): boolean {
        return this.password === password;
    }
}
