import { Component, inject, signal } from '@angular/core';
import iconLogo from '@assets/logo.svg';
import { ToggleBar } from '@app/components/toggle-bar';
import { Button } from '@app/components/button';
import { Router, RouterLink } from '@angular/router';
import { GameService, Mark } from '@app/services/game-service';
import { Dialog } from '@app/components/dialog';
import { Difficulty } from '@app/utils/bot';

@Component({
  selector: 'app-home-page',
  imports: [ToggleBar, Button, RouterLink, Dialog],
  template: `
    @if (showDifficultyDialog()) {
      <app-dialog [isShouldShowCollapseButton]="false">
        <ng-container header>
          <h3 class="mb-2 text-preset-4 font-bold text-white">Select Difficulty</h3>
        </ng-container>

        <ng-container content>
          <div class="flex flex-col gap-4">
            <app-button
              class="w-full"
              variant="primary"
              [selected]="botDifficulty() === 'easy'"
              (click)="botDifficulty.set('easy')"
            >
              Easy
            </app-button>
            <app-button
              class="w-full"
              variant="silver"
              [selected]="botDifficulty() === 'medium'"
              (click)="botDifficulty.set('medium')"
            >
              Medium
            </app-button>
            <app-button
              class="w-full"
              variant="secondary"
              [selected]="botDifficulty() === 'hard'"
              (click)="botDifficulty.set('hard')"
            >
              Hard
            </app-button>
          </div>
        </ng-container>

        <ng-container footer>
          <app-button variant="silver" (click)="showDifficultyDialog.set(false)">
            Cancel
          </app-button>
          <app-button variant="primary" (click)="startSinglePlayer()"> Start Game </app-button>
        </ng-container>
      </app-dialog>
    }

    <section
      class="menu-section flex flex-col items-center justify-center gap-6 container mx-auto w-3/5 h-screen"
    >
      <div class="logo flex justify-center">
        <img [src]="iconLogo" alt="logo" width="72" height="32" />
      </div>
      <div class="card bg-slate-800 p-4 rounded-md flex flex-col gap-4 w-full">
        <span class="text-preset-4 text-slate-300 text-center w-full">Pick player 1's mark</span>
        <app-toggle-bar (markSelected)="updatePlayerMark($event)" />
        <span class="text-preset-5 text-slate-300 text-center w-full uppercase"
          >Remember: X goes first
        </span>
      </div>

      <app-button
        variant="primary"
        size="lg"
        class="w-full"
        (click)="showDifficultyDialog.set(true)"
        >New Game (VS CPU)</app-button
      >
      <app-button variant="secondary" size="lg" class="w-full" [routerLink]="['/game/multi/123']"
        >New Game (VS Player)</app-button
      >
    </section>
  `,
})
export class HomePage {
  iconLogo = iconLogo;

  private gameService = inject(GameService);
  private router = inject(Router);

  playerState = this.gameService.getPlayerState();

  showDifficultyDialog = signal(false);
  botDifficulty = signal<Difficulty>('hard');

  updatePlayerMark(mark: Mark) {
    this.gameService.setPlayerMark(mark);
  }

  startSinglePlayer() {
    this.showDifficultyDialog.set(false);
    this.router.navigate(['/game/single'], {
      queryParams: { difficulty: this.botDifficulty() },
    });
  }
}
