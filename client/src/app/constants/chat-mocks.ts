import { Message } from '@app/interfaces/message';

export const MOCK_MESSAGE: Message = { text: 'Test Text', author: 'User', date: new Date() };

export const MOCK_MESSAGES: Message[] = [
    {
        text: 'Test Text',
        author: 'User1',
        date: new Date(),
    },
];

export const MOCK_ROOM_CODE = '1234';
