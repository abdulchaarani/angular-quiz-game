import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
    let service: AuthService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [AuthService],
        }).compile();

        service = module.get<AuthService>(AuthService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('isValidPassword() should return true if the password in parameter is the right one, else false', () => {
        const RIGHT_PASSWORD = 'log2990-305'; // TODO: Mock instead?
        const WRONG_CASE_PASSWORD = 'LOG2990-305';
        expect(service.isValidPassword(RIGHT_PASSWORD)).toBeTruthy();
        expect(service.isValidPassword(WRONG_CASE_PASSWORD)).toBeFalsy();
    });
});
