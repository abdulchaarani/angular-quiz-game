import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { GamesCreationService } from '@app/services/games-creation.service';

@Component({
    selector: 'app-admin-create-game',
    templateUrl: './admin-create-game.component.html',
    styleUrls: ['./admin-create-game.component.scss'],
})
export class AdminCreateGameComponent {
    constructor(
        private readonly formBuilder: FormBuilder,
        private readonly gamesCreationService: GamesCreationService,
    ) {}

    gameForm = this.formBuilder.nonNullable.group({
        title: ['', Validators.required],
        description: ['', [Validators.required]],
        duration: ['', Validators.required],
    });
    onSubmit(): void {
        if (this.gameForm.value.title && this.gameForm.value.description && this.gameForm.value.duration) {
            this.gamesCreationService.createGame(this.gameForm.value.title, this.gameForm.value.description, parseInt(this.gameForm.value.duration));
            this.gameForm.reset();
        }
    }
}
