import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  template: '<h1>TCG Scanner</h1><router-outlet />',
})
export class App {}
