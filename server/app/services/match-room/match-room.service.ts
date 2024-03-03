import { Game } from '@app/model/database/game';
import { MatchRoom } from '@app/model/schema/match-room.schema';
import { Player } from '@app/model/schema/player.schema';
import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class MatchRoomService {
    matchRooms: MatchRoom[];

    constructor() {
        this.matchRooms = [];
    }

    generateRoomCode(): string {
        let generatedCode: string;
        while (!generatedCode || this.getMatchRoomByCode(generatedCode)) {
            generatedCode = Math.floor(Math.random() * 9000).toString();
        }
        while (generatedCode.length < 4) {
            generatedCode = '0' + generatedCode;
        }
        return generatedCode;
    }

    getMatchRoomByCode(code: string): MatchRoom | undefined {
        return this.matchRooms.find((room: MatchRoom) => {
            return room.code === code;
        });
    }

    addMatchRoom(selectedGame: Game): MatchRoom {
        const newRoom: MatchRoom = {
            code: this.generateRoomCode(),
            isLocked: false,
            game: selectedGame,
            bannedUsernames: [],
            players: [],
            messages: [],
        };
        this.matchRooms.push(newRoom);
        return newRoom;
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

    getPlayers(matchRoomCode: string): Player[] {
        return this.getMatchRoomByCode(matchRoomCode).players;
    }

    addPlayer(playerSocket: Socket, matchRoomCode: string, newUsername: string): Player | undefined {
        if (!this.isValidUsername(matchRoomCode, newUsername)) {
            return undefined;
        }
        const newPlayer: Player = {
            username: newUsername,
            score: 0,
            bonusCount: 0,
            isPlaying: true,
            socket: playerSocket,
        };
        this.getMatchRoomByCode(matchRoomCode).players.push(newPlayer);
        return newPlayer;
    }

    getPlayerByUsername(matchRoomCode: string, username: string): Player | undefined {
        return this.getPlayers(matchRoomCode).find((player: Player) => {
            return player.username.toUpperCase() === username.toUpperCase();
        });
    }

    deletePlayer(matchRoomCode: string, username: string): void {
        this.getMatchRoomByCode(matchRoomCode).players.filter((player) => {
            player.username === username;
        });
    }

    getBannedUsernames(matchRoomCode: string): string[] {
        return this.getMatchRoomByCode(matchRoomCode).bannedUsernames;
    }

    addBannedUsername(matchRoomCode: string, username: string) {
        const room = this.getMatchRoomByCode(matchRoomCode);
        if (room) {
            room.bannedUsernames.push(username.toUpperCase());
        }
    }

    isBannedUsername(matchRoomCode: string, username: string): boolean {
        const bannedUsernames = this.getBannedUsernames(matchRoomCode);
        const usernameIndex = bannedUsernames.findIndex((name: string) => {
            name.toUpperCase() === username.toUpperCase();
        });
        return usernameIndex === -1 ? false : true;
    }

    isValidUsername(matchRoomCode: string, username: string) {
        const hasHostConflict = username.toUpperCase() === 'ORGANISATEUR';
        const isBannedUsername = this.isBannedUsername(matchRoomCode, username);
        const isUsedUsername = this.getPlayerByUsername(matchRoomCode, username) ? true : false;
        return !hasHostConflict && !isBannedUsername && !isUsedUsername;
    }
}
