import { Message } from './message';

export interface MessageInfo {
    roomCode: string;
    message: Message;
}

export interface ChatStateInfo{
    matchRoomCode: string;
    playerUsername: string;
}
