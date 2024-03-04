import { Game } from '@app/model/database/game';
import { MatchRoom } from '@app/model/schema/match-room.schema';
import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

const FACTOR = 9000;
const MAXIMUM_CODE_LENGTH = 4;

@Injectable()
export class MatchRoomService {
    matchRooms: MatchRoom[];

    constructor() {
        this.matchRooms = [];
    }

    generateRoomCode(): string {
        let generatedCode: string;
        while (!generatedCode || this.getMatchRoomByCode(generatedCode)) {
            generatedCode = Math.floor(Math.random() * FACTOR).toString();
        }
        while (generatedCode.length < MAXIMUM_CODE_LENGTH) {
            generatedCode = '0' + generatedCode;
        }
        return generatedCode;
    }

    getMatchRoomByCode(code: string): MatchRoom | undefined {
        return this.matchRooms.find((room: MatchRoom) => {
            return room.code === code;
        });
    }

    addMatchRoom(selectedGame: Game, socket: Socket): MatchRoom {
        const newRoom: MatchRoom = {
            code: this.generateRoomCode(),
            hostSocket: socket,
            isLocked: false,
            isPlaying: false,
            game: selectedGame,
            bannedUsernames: [],
            players: [],
            messages: [],
        };
        this.matchRooms.push(newRoom);
        return newRoom;
    }

    getRoomCodeByHostSocket(socketId: string): string {
        let matchRoomCode: string;
        this.matchRooms.forEach((matchRoom: MatchRoom) => {
            matchRoomCode = matchRoom.hostSocket.id === socketId ? matchRoom.code : undefined;
        });
        return matchRoomCode;
    }

    toggleLockMatchRoom(matchRoomCode: string): void {
        this.getMatchRoomByCode(matchRoomCode).isLocked = !this.getMatchRoomByCode(matchRoomCode).isLocked;
    }

    deleteMatchRoom(matchRoomCode: string): void {
        this.matchRooms.filter((room) => room.code === matchRoomCode);
    }

    isValidMatchRoomCode(code: string): boolean {
        const room = this.getMatchRoomByCode(code);
        if (!room) {
            return false;
        }
        return !room.isLocked;
    }

    // TODO: Call this function when the host sends the event to start the match.
    canStartMatch(code: string): boolean {
        const room = this.getMatchRoomByCode(code);
        if (!room) {
            return false;
        }
        return room.isLocked && room.players.length > 0;
    }
}
