import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(private jwtService: JwtService) {}

    private readonly password = 'log2990-305';

    isValidPassword(password: string): boolean {
        return this.password === password;
    }

    async signIn(username: string, password: string): Promise<{ access_token: string }> {
        if (this.password !== password) {
            throw new UnauthorizedException();
        }
        const payload = { sub: username };
        return {
            access_token: await this.jwtService.signAsync(payload),
        };
    }
}
