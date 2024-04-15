import { Component, Input, OnInit } from '@angular/core';
import { AudioService } from '@app/services/audio/audio.service';

@Component({
    selector: 'app-audio-player',
    templateUrl: './audio-player.component.html',
    styleUrls: ['./audio-player.component.scss'],
})
export class AudioPlayerComponent implements OnInit {
    @Input() audioUrl: string;
    @Input() autoplay: boolean = false;

    isPlaying: boolean = false;

    constructor(private audioService: AudioService) {}

    ngOnInit(): void {
        this.audioService.set(this.audioUrl);
        if (this.autoplay) this.play();
    }

    toggle() {
        if (this.isPlaying) this.pause();
        else this.play();
    }

    pause() {
        this.audioService.pause();
        this.isPlaying = false;
    }

    play() {
        this.audioService.play();
        this.isPlaying = true;
    }

    // stop() {
    //     this.audioService.stop();
    // }
    mute() {
        this.audioService.mute();
    }

    unmute() {
        this.audioService.unmute();
    }
}
