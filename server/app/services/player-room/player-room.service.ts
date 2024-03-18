import { BANNED_USERNAME, HOST_CONFLICT, USED_USERNAME } from '@app/constants/match-login-errors';
import { MatchRoom } from '@app/model/schema/match-room.schema';
import { Player } from '@app/model/schema/player.schema';
import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

const INDEX_NOT_FOUND = -1;
const HOST_USERNAME = 'ORGANISATEUR';

@Injectable()
export class PlayerRoomService {
    constructor(private readonly matchRoomService: MatchRoomService) {}

    getPlayers(code: string): Player[] {
        return this.matchRoomService.getRoom(code).players;
    }

    getPlayersStringified(code: string): string {
        const players = this.getPlayers(code);
        return JSON.stringify(players, (key, value) => {
            if (key !== 'socket') {
                return value;
            }
        });
    }

    addPlayer(playerSocket: Socket, matchRoomCode: string, newUsername: string): Player | undefined {
        if (this.getUsernameErrors(matchRoomCode, newUsername)) {
            return undefined;
        }

        const newPlayer: Player = {
            username: newUsername,
            answer: { selectedChoices: new Map<string, boolean>(), isSubmitted: false },
            score: 0,
            bonusCount: 0,
            isPlaying: true,
            socket: playerSocket,
        };

        const matchRoom = this.matchRoomService.getRoom(matchRoomCode);
        matchRoom.players.push(newPlayer);
        matchRoom.activePlayers++;

        return newPlayer;
    }

    deletePlayerBySocket(socketId: string): string {
        let foundPlayer: Player;
        let foundMatchRoom: MatchRoom;
        this.matchRoomService.matchRooms.forEach((matchRoom: MatchRoom) => {
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
        const roomIndex = this.matchRoomService.getRoomIndex(matchRoomCode);
        const playerIndex = this.matchRoomService.getRoom(matchRoomCode).players.findIndex((player: Player) => {
            return player.username === username;
        });
        if (roomIndex !== INDEX_NOT_FOUND && playerIndex !== INDEX_NOT_FOUND) {
            this.matchRoomService.matchRooms[roomIndex].players[playerIndex].isPlaying = false;
            this.matchRoomService.matchRooms[roomIndex].activePlayers--;
        }
    }

    deletePlayer(matchRoomCode: string, username: string): void {
        const roomIndex = this.matchRoomService.getRoomIndex(matchRoomCode);
        this.matchRoomService.matchRooms[roomIndex].players = this.matchRoomService.matchRooms[roomIndex].players.filter((player) => {
            return player.username.toUpperCase() !== username.toUpperCase();
        });
    }

    getBannedUsernames(matchRoomCode: string): string[] {
        return this.matchRoomService.getRoom(matchRoomCode).bannedUsernames;
    }

    addBannedUsername(matchRoomCode: string, username: string) {
        const room = this.matchRoomService.getRoom(matchRoomCode);
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

    getUsernameErrors(matchRoomCode: string, username: string): string {
        let errors = '';
        if (this.matchRoomService.getRoom(matchRoomCode).isTestRoom) return errors;
        if (username.toUpperCase() === HOST_USERNAME) {
            errors += HOST_CONFLICT;
        }
        if (this.isBannedUsername(matchRoomCode, username)) {
            errors += BANNED_USERNAME;
        }
        if (this.getPlayerByUsername(matchRoomCode, username)) {
            errors += USED_USERNAME;
        }
        return errors;
    }
}
