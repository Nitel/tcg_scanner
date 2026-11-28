import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterLink, RouterOutlet],
  selector: 'app-root',
  template: '<h1>TCG Scanner</h1><a routerLink="/benchmark">Banc d’essai</a><router-outlet />',
})
export class App {}
