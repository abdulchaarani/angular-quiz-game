import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class AudioService {
    private audioObject: HTMLAudioElement = new Audio();

    // private stop$ = new Subject();

    set(url: string) {
        this.audioObject.src = url;
    }

    play() {
        this.audioObject.play();
    }
    pause() {
        this.audioObject.pause();
    }
    // stop() {
    //     this.stop$.next();
    // }

    mute() {
        this.audioObject.volume = 0;
    }
    unmute() {
        this.audioObject.volume = 1;
    }
}
