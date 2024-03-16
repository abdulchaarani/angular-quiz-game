import { Message } from '@app/interfaces/message';

export const MOCK_DATE = new Date(2024, 1, 1);

export const MOCK_MESSAGE: Message = { text: 'Test Text', author: 'User', date: MOCK_DATE };

export const MOCK_MESSAGES: Message[] = [
    {
        text: 'Test Text',
        author: 'User1',
        date: MOCK_DATE,
    },
];

export const MOCK_ROOM_CODE = '1234';
