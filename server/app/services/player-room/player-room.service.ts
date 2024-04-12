import { BANNED_USERNAME, HOST_CONFLICT, USED_USERNAME } from '@app/constants/match-login-errors';
import { MultipleChoiceAnswer } from '@app/model/answer-types/multiple-choice-answer/multiple-choice-answer';
import { MatchRoom } from '@app/model/schema/match-room.schema';
import { Player } from '@app/model/schema/player.schema';
import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { HOST_USERNAME } from '@common/constants/match-constants';
import { AnswerCorrectness } from '@common/constants/answer-correctness';
import { PlayerState } from '@common/constants/player-states';
import { MatchEvents } from '@common/events/match.events';
import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

const INDEX_NOT_FOUND = -1;

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
            answer: new MultipleChoiceAnswer(),
            score: 0,
            answerCorrectness: AnswerCorrectness.WRONG,
            bonusCount: 0,
            isPlaying: true,
            isChatActive: true,
            socket: playerSocket,
            state: PlayerState.default,
        };

        const matchRoom = this.matchRoomService.getRoom(matchRoomCode);
        matchRoom.players.push(newPlayer);
        matchRoom.activePlayers++;
        return newPlayer;
    }

    deletePlayerBySocket(socketId: string): string | undefined {
        let foundPlayer: Player;
        let foundMatchRoom: MatchRoom;
        this.matchRoomService.matchRooms.forEach((matchRoom: MatchRoom) => {
            foundPlayer = matchRoom.players.find((currentPlayer: Player) => {
                return currentPlayer.socket.id === socketId;
            });
            if (!foundMatchRoom) {
                foundMatchRoom = foundPlayer ? matchRoom : undefined;
            }
        });
        if (foundPlayer && foundMatchRoom && !foundMatchRoom.isPlaying) {
            this.deletePlayer(foundMatchRoom.code, foundPlayer.username);
        } else if (foundPlayer && foundMatchRoom && foundMatchRoom.isPlaying) {
            this.makePlayerInactive(foundMatchRoom.code, foundPlayer.username);
        }
        return foundMatchRoom ? foundMatchRoom.code : undefined;
    }
    
    getPlayerBySocket(socketId: string): Player | undefined {
        let foundPlayer: Player;
        this.matchRoomService.matchRooms.forEach((matchRoom: MatchRoom) => {
            const player = matchRoom.players.find((player: Player) => player.socket.id === socketId);
            if (player) {
                foundPlayer = player;
                return;
            }
        });
        return foundPlayer;
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
            this.matchRoomService.matchRooms[roomIndex].players[playerIndex].state = PlayerState.exit;
            this.matchRoomService.matchRooms[roomIndex].players[playerIndex].isPlaying = false;
            this.matchRoomService.matchRooms[roomIndex].activePlayers--;
        }
    }

    deletePlayer(matchRoomCode: string, username: string): void {
        const roomIndex = this.matchRoomService.getRoomIndex(matchRoomCode);
        this.matchRoomService.matchRooms[roomIndex].activePlayers--;
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
        return usernameIndex !== INDEX_NOT_FOUND;
    }

    getUsernameErrors(matchRoomCode: string, username: string): string {
        let errors = '';
        if (this.matchRoomService.getRoom(matchRoomCode).isTestRoom) return errors;
        if (username.trim().toUpperCase() === HOST_USERNAME) {
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

    setStateForAll(matchRoomCode: string, state: string): void {
        const matchRoomIndex = this.matchRoomService.getRoomIndex(matchRoomCode);
        this.matchRoomService.matchRooms[matchRoomIndex].players.forEach((player: Player) => {
            if (player.state !== PlayerState.exit) {
                player.state = state;
                return player;
            }
        });
        this.sendPlayersToHost(matchRoomCode);
    }

    setState(socketId: string, state: string): void {
        let foundPlayerIndex = INDEX_NOT_FOUND;
        let foundMatchRoomIndex = INDEX_NOT_FOUND;
        this.matchRoomService.matchRooms.forEach((matchRoom: MatchRoom, currentIndex: number) => {
            foundPlayerIndex = matchRoom.players.findIndex((currentPlayer: Player) => {
                return currentPlayer.socket.id === socketId;
            });
            if (foundMatchRoomIndex === INDEX_NOT_FOUND) {
                foundMatchRoomIndex = foundPlayerIndex !== INDEX_NOT_FOUND ? currentIndex : INDEX_NOT_FOUND;
            }
        });
        if (foundPlayerIndex !== INDEX_NOT_FOUND && foundMatchRoomIndex !== INDEX_NOT_FOUND) {
            this.matchRoomService.matchRooms[foundMatchRoomIndex].players[foundPlayerIndex].state = state;
            this.sendPlayersToHost(this.matchRoomService.matchRooms[foundMatchRoomIndex].code);
        }
    }

    sendPlayersToHost(matchRoomCode: string) {
        const matchRoomIndex = this.matchRoomService.getRoomIndex(matchRoomCode);
        this.matchRoomService.matchRooms[matchRoomIndex].hostSocket.emit(MatchEvents.FetchPlayersData, this.getPlayersStringified(matchRoomCode));
    }
}
