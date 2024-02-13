import { Message } from '@common/message';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
    private readonly password = 'log2990-305';

    isValidPassword(password: string): boolean {
        // The point is to use the common interface Message to generate common folder and avoid compilation errors.
        const message: Message = { title: '', body: '' };
        return this.password === password && message.title === '';
    }
}
