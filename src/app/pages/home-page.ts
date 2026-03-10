import { Component, inject } from '@angular/core';
import iconLogo from '@assets/logo.svg';
import { ToggleBar } from '@app/components/toggle-bar';
import { Button } from '@app/components/button';
import { RouterLink } from '@angular/router';
import { GameService, Mark } from '@app/services/game-service';

@Component({
  selector: 'app-home-page',
  imports: [ToggleBar, Button, RouterLink],
  template: `
    <section
      class="menu-section flex flex-col items-center justify-center gap-6 container mx-auto w-3/5 h-full"
    >
      <div class="logo flex justify-center">
        <img [src]="iconLogo" />
      </div>
      <div class="card bg-slate-800 p-4 rounded-md flex flex-col gap-4 w-full">
        <span class="text-preset-4 text-slate-300 text-center w-full">Pick player 1's mark</span>
        <app-toggle-bar (markSelected)="updatePlayerMark($event)" />
        <span class="text-preset-5 text-slate-300 text-center w-full uppercase"
          >Remember: X goes first
        </span>
      </div>

      <app-button variant="primary" size="lg" class="w-full"
        ><a [routerLink]="['/game/single']">New Game (VS CPU)</a></app-button
      >
      <app-button variant="secondary" size="lg" class="w-full"
        ><a [routerLink]="['/game/multi/123']">New Game (VS Player)</a></app-button
      >
    </section>
  `,
})
export class HomePage {
  iconLogo = iconLogo;

  private gameService = inject(GameService);

  playerState = this.gameService.getPlayerState();

  updatePlayerMark(mark: Mark) {
    this.gameService.setPlayerMark(mark);
  }
}
