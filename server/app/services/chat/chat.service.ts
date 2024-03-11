import { Message } from '@app/model/schema/message.schema';

export class ChatService {
    messages: Map<string, Message[]> = new Map();
    constructor() {}

    addMessage(message: Message, roomCode: string): Message {
        const roomMessages = this.messages.get(roomCode) || [];
        roomMessages.push(message);
        this.messages.set(roomCode, roomMessages);
        return message;
    }

    getMessages(roomCode: string): Message[] {
        return this.messages.get(roomCode);
    }
}
