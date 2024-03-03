import { Game } from '@app/model/database/game';
import { MatchRoom } from '@app/model/schema/match-room.schema';
import { Player } from '@app/model/schema/player.schema';
import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

const FACTOR = 9000;
const MAXIMUM_CODE_LENGTH = 4;
const INDEX_NOT_FOUND = -1;

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

    getPlayers(matchRoomCode: string): Player[] {
        return this.getMatchRoomByCode(matchRoomCode).players;
    }

    getPlayersStringified(matchRoomCode: string): string {
        const players = this.getPlayers(matchRoomCode);
        return JSON.stringify(players, (key, value) => {
            if (key !== 'socket') {
                return value;
            }
        });
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

    deletePlayerBySocket(socketId: string): string {
        let foundPlayer: Player;
        let foundMatchRoom: MatchRoom;
        this.matchRooms.forEach((matchRoom: MatchRoom) => {
            foundPlayer = matchRoom.players.find((currentPlayer: Player) => {
                return currentPlayer.socket.id === socketId;
            });
            foundMatchRoom = foundPlayer ? matchRoom : undefined;
        });
        if (foundPlayer && foundMatchRoom && !foundMatchRoom.isPlaying) {
            this.deletePlayer(foundMatchRoom.code, foundPlayer.username);
        } else if (foundPlayer && foundMatchRoom && foundMatchRoom.isPlaying) {
            this.makePlayerInactive(foundMatchRoom.code, foundPlayer.username);
        }
        return foundMatchRoom ? foundMatchRoom.code : undefined;
    }

    getPlayerByUsername(matchRoomCode: string, username: string): Player | undefined {
        return this.getPlayers(matchRoomCode).find((player: Player) => {
            return player.username.toUpperCase() === username.toUpperCase();
        });
    }

    makePlayerInactive(matchRoomCode: string, username: string): void {
        this.getMatchRoomByCode(matchRoomCode).players.find((player: Player) => {
            return player.username === username;
        }).isPlaying = false;
    }

    deletePlayer(matchRoomCode: string, username: string): void {
        this.getMatchRoomByCode(matchRoomCode).players = this.getMatchRoomByCode(matchRoomCode).players.filter((player) => {
            return player.username.toUpperCase() !== username.toUpperCase();
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
            return name.toUpperCase() === username.toUpperCase();
        });
        return usernameIndex === INDEX_NOT_FOUND ? false : true;
    }

    isValidUsername(matchRoomCode: string, username: string) {
        const hasHostConflict = username.toUpperCase() === 'ORGANISATEUR';
        const isBannedUsername = this.isBannedUsername(matchRoomCode, username);
        const isUsedUsername = this.getPlayerByUsername(matchRoomCode, username) ? true : false;
        return !hasHostConflict && !isBannedUsername && !isUsedUsername;
    }
}
