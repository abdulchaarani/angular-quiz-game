import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { DialogAdminPasswordComponent } from '../../components/dialog-admin-password/dialog-admin-password.component';

@Component({
    selector: 'app-home-page',
    templateUrl: './home-page.component.html',
    styleUrls: ['./home-page.component.scss'],
})
export class HomePageComponent {
    username: string = 'admin';
    password: string;
    constructor(
        public dialog: MatDialog,
        private readonly http: HttpClient,
        private router: Router,
    ) {}
    openDialog(): void {
        const dialogRef = this.dialog.open(DialogAdminPasswordComponent, {
            data: { username: this.username, password: this.password },
        });

        dialogRef.afterClosed().subscribe((result) => {
            this.password = result;

            // TODO: Migrate logic to the standardized service when it will be available (+ use pipe or something else than the .subscribe(), which is deprecated)
            const contentJsonHeader = new HttpHeaders({
                'Content-Type': 'application/json',
            });
            this.http
                .post(`${environment.serverUrl}/login`, JSON.stringify({ username: this.username, password: this.password }), {
                    observe: 'response',
                    headers: contentJsonHeader,
                })
                .subscribe(
                    (response) => {
                        if (response.status == 200) {
                            this.router.navigate(['/admin/games']);
                        }
                    },
                    (error) => {
                        console.log('YOU SHALL NOT PASS');
                    },
                );
        });
    }
}
