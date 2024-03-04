import { MatchRoom } from '@app/model/schema/match-room.schema';
import { Player } from '@app/model/schema/player.schema';
import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { MatchRoomService } from '../match-room/match-room.service';

const INDEX_NOT_FOUND = -1;
@Injectable()
export class PlayerRoomService {
    constructor(private matchRoomService: MatchRoomService) {}

    getPlayers(code: string): Player[] {
        return this.matchRoomService.getMatchRoomByCode(code).players;
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
        this.matchRoomService.getMatchRoomByCode(matchRoomCode).players.push(newPlayer);
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
        this.matchRoomService.getMatchRoomByCode(matchRoomCode).players.find((player: Player) => {
            return player.username === username;
        }).isPlaying = false;
    }

    deletePlayer(matchRoomCode: string, username: string): void {
        this.matchRoomService.getMatchRoomByCode(matchRoomCode).players = this.matchRoomService
            .getMatchRoomByCode(matchRoomCode)
            .players.filter((player) => {
                return player.username.toUpperCase() !== username.toUpperCase();
            });
    }

    getBannedUsernames(matchRoomCode: string): string[] {
        return this.matchRoomService.getMatchRoomByCode(matchRoomCode).bannedUsernames;
    }

    addBannedUsername(matchRoomCode: string, username: string) {
        const room = this.matchRoomService.getMatchRoomByCode(matchRoomCode);
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
