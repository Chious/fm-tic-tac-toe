import { Component, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs';
import iconLogo from '@assets/logo.svg';
import iconX from '@assets/icon-x.svg';
import iconO from '@assets/icon-o.svg';
import { ToggleBar } from '@app/components/toggle-bar';
import { Button } from '@app/components/button';
import { Router } from '@angular/router';
import { GameService, Mark } from '@app/services/game-service';
import { Dialog } from '@app/components/dialog';
import { Difficulty } from '@app/utils/bot';
import { QRCodeComponent } from 'angularx-qrcode';

@Component({
  selector: 'app-home-page',
  imports: [ToggleBar, Button, Dialog, QRCodeComponent],
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

    @if (showWaitingDialog()) {
      <app-dialog [isShouldShowCollapseButton]="false">
        <ng-container header>
          <h3 class="mb-1 text-preset-4 font-bold text-white">Waiting for Opponent</h3>
          <p class="text-slate-400 text-sm">
            Share the link or QR code with a friend to play together!
          </p>
        </ng-container>

        <ng-container content>
          <div class="flex flex-col items-center gap-5 py-2">
            <!-- Player slots -->
            <div class="flex items-center justify-center gap-8">
              <!-- Player 1 — joined (always X as room creator) -->
              <div class="flex flex-col items-center gap-2">
                <div class="rounded-xl bg-slate-700 p-4 ring-2 ring-teal-400">
                  <img [src]="iconX" alt="X" width="40" height="40" />
                </div>
                <span class="text-xs font-semibold uppercase tracking-wide text-teal-400"
                  >Joined</span
                >
              </div>

              <span class="text-lg font-bold text-slate-500">VS</span>

              <!-- Player 2 — waiting -->
              <div class="flex flex-col items-center gap-2 opacity-35">
                <div class="rounded-xl bg-slate-700 p-4">
                  <img [src]="iconO" alt="O" width="40" height="40" class="blur-sm" />
                </div>
                <span
                  class="animate-pulse text-xs font-semibold uppercase tracking-wide text-slate-400"
                  >Waiting…</span
                >
              </div>
            </div>

            <!-- QR Code -->
            <div class="rounded-xl bg-white p-3 shadow-lg">
              <qrcode
                [qrdata]="shareUrl()"
                [width]="180"
                [margin]="1"
                [errorCorrectionLevel]="'M'"
                elementType="svg"
                cssClass="block"
              ></qrcode>
            </div>

            <!-- Shareable URL -->
            <div class="flex w-full items-center gap-2 rounded-lg bg-slate-700 px-3 py-2">
              <span class="flex-1 truncate text-left text-sm text-slate-300">{{ shareUrl() }}</span>
              <button
                (click)="copyShareUrl()"
                class="shrink-0 rounded-md p-1 text-slate-400 transition-colors hover:text-white"
                aria-label="Copy link"
              >
                @if (copySuccess()) {
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 text-green-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                } @else {
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                }
              </button>
            </div>

            <!-- Waiting indicator -->
            <p class="animate-pulse text-sm text-slate-400">Waiting for a second player to join…</p>
          </div>
        </ng-container>

        <ng-container footer>
          <app-button variant="silver" (click)="cancelWaiting()">Cancel</app-button>
          <app-button variant="secondary" (click)="joinMultiplayerGame()">Join Game</app-button>
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
      <app-button
        variant="secondary"
        size="lg"
        class="w-full"
        [disabled]="isCreatingRoom()"
        (click)="onPlayerVsPlayer()"
        >{{ isCreatingRoom() ? 'Creating Room…' : 'New Game (VS Player)' }}</app-button
      >
    </section>
  `,
})
export class HomePage {
  iconLogo = iconLogo;
  iconX = iconX;
  iconO = iconO;

  private http = inject(HttpClient);
  private gameService = inject(GameService);
  private router = inject(Router);
  private document = inject(DOCUMENT);

  playerState = this.gameService.getPlayerState();

  showDifficultyDialog = signal(false);
  botDifficulty = signal<Difficulty>('hard');

  showWaitingDialog = signal(false);
  isCreatingRoom = signal(false);
  shareUrl = signal('');
  copySuccess = signal(false);
  private multiplayerRoomId = signal<string | null>(null);

  updatePlayerMark(mark: Mark) {
    this.gameService.setPlayerMark(mark);
  }

  startSinglePlayer() {
    this.showDifficultyDialog.set(false);
    this.router.navigate(['/game/single'], {
      queryParams: { difficulty: this.botDifficulty() },
    });
  }

  onPlayerVsPlayer() {
    this.isCreatingRoom.set(true);
    this.http
      .post<{ roomId: string }>(`${import.meta.env['NG_APP_COLYSEUS_HTTP_URL']}/api/game`, {})
      .pipe(finalize(() => this.isCreatingRoom.set(false)))
      .subscribe({
        next: (data) => {
          if (data.roomId) {
            const origin = this.document.location.origin;
            this.multiplayerRoomId.set(data.roomId);
            this.shareUrl.set(`${origin}/game/multi/${data.roomId}`);
            this.showWaitingDialog.set(true);
          }
        },
        error: (err) => {
          console.error('Failed to create multiplayer game', err);
        },
      });
  }

  copyShareUrl() {
    navigator.clipboard.writeText(this.shareUrl()).then(() => {
      this.copySuccess.set(true);
      setTimeout(() => this.copySuccess.set(false), 2000);
    });
  }

  joinMultiplayerGame() {
    const roomId = this.multiplayerRoomId();
    if (roomId) {
      this.showWaitingDialog.set(false);
      this.router.navigate(['/game/multi', roomId]);
    }
  }

  cancelWaiting() {
    this.showWaitingDialog.set(false);
    this.multiplayerRoomId.set(null);
    this.shareUrl.set('');
  }
}
