import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from '@app/components/button';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, Button],
  template: `
    <div class="flex flex-col items-center justify-center h-screen gap-4">
      <h1 class="text-4xl font-bold text-white">404</h1>
      <p class="text-2xl text-white">Page not found</p>
      <app-button variant="primary" size="sm" [routerLink]="['/']">Go back to home</app-button>
    </div>
  `,
})
export class NotFound {}
