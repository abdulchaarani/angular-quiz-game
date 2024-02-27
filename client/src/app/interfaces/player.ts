export interface Player {
    username: string;
    score: number;
    bonusCount: number;
    isPlaying: boolean;
}

// TODO: Share this interface on server side; make the manipulations there
// (do not allow players to edit their own scores on client side)
