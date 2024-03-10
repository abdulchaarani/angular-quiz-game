import { ADMIN_PASSWORD } from '@app/constants/admin-auth-info';
import { Message } from '@common/interfaces/message';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthenticationService {
    isValidPassword(password: string): boolean {
        // The point is to use the common interface Message to generate common folder and avoid compilation errors.
        const message: Message = { title: '', body: '' };
        return ADMIN_PASSWORD === password && message.title === '';
    }
}
