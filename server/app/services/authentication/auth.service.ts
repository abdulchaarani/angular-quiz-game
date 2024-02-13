import { ADMIN_PASSWORD } from '@app/constants/admin-auth-info';
import { Message } from '@common/message';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
    isValidPassword(password: string): boolean {
        // The point is to use the common interface Message to generate common folder and avoid compilation errors.
        const message: Message = { title: '', body: '' };
        return ADMIN_PASSWORD === password && message.title === '';
    }
}
