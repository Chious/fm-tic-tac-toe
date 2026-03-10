import { Component, OnDestroy, OnInit, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import iconLogo from '@assets/logo.svg';
import iconO from '@assets/icon-o.svg';
import iconX from '@assets/icon-x.svg';
import iconReset from '@assets/icon-restart.svg';
import { BoardCell } from '@app/components/board-cell';
import { Button } from '@app/components/button';
import { GameService, GameState, INITIAL_BOARD } from '@app/services/game-service';
import { Dialog } from '@app/components/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { GameModeStrategy } from '@app/strategies/game-mode.strategy';
import { SinglePlayerStrategy } from '@app/strategies/single-player.strategy';
import { MultiplayerStrategy } from '@app/strategies/multiplayer.stragegy';

type StatKey = 'X' | 'O' | 'Tie';
interface GameStat {
  key: StatKey;
  label: string;
  score: number;
}

const INITIAL_GAME_STATE: GameState = {
  board: INITIAL_BOARD,
  startingPlayer: 'X',
  currentPlayer: 'X',
  gameStatus: null,
  gameStats: { X: 0, O: 0, Tie: 0 },
};

@Component({
  selector: 'app-game-page',
  imports: [BoardCell, Button, Dialog],
  template: `
    @if (isWaitingForOpponent()) {
      <app-dialog [isShouldShowCollapseButton]="false">
        <ng-container header>
          <h3 class="mb-1 text-preset-4 font-bold text-white">Waiting for Opponent</h3>
          <p class="text-slate-400 text-sm">Share the link with a friend to start the game!</p>
        </ng-container>

        <ng-container content>
          <div class="flex items-center justify-center gap-8 py-4">
            <!-- Player 1 slot — already joined -->
            <div class="flex flex-col items-center gap-2">
              <div class="rounded-xl bg-slate-700 p-4 ring-2 ring-teal-400">
                <img
                  [src]="playerState().mark === 'O' ? iconO : iconX"
                  alt="you"
                  width="40"
                  height="40"
                />
              </div>
              <span class="text-xs font-semibold text-teal-400 uppercase tracking-wide">You</span>
            </div>

            <span class="text-lg font-bold text-slate-500">VS</span>

            <!-- Player 2 slot — waiting -->
            <div class="flex flex-col items-center gap-2 opacity-35">
              <div class="rounded-xl bg-slate-700 p-4">
                <img
                  [src]="playerState().mark === 'O' ? iconX : iconO"
                  alt="opponent"
                  width="40"
                  height="40"
                  class="blur-sm"
                />
              </div>
              <span
                class="animate-pulse text-xs font-semibold text-slate-400 uppercase tracking-wide"
                >Waiting…</span
              >
            </div>
          </div>
        </ng-container>

        <ng-container footer>
          <app-button variant="silver" (click)="onQuit()">Leave</app-button>
        </ng-container>
      </app-dialog>
    }

    @if (isGameOver()) {
      <app-dialog [isShouldShowCollapseButton]="true">
        <ng-container header>
          @if (gameStatus() === 'draw') {
            <h3 class="mb-2 text-preset-4 font-bold text-white">It's a Draw!</h3>
          } @else if (gameStatus() === playerState().mark) {
            <h3 class="mb-2 text-preset-4 font-bold text-white">You Won!</h3>
          } @else {
            <h3 class="mb-2 text-preset-4 font-bold text-white">You Lost!</h3>
          }
        </ng-container>

        <ng-container content>
          <div class="text-preset-1 text-teal-400 flex items-center justify-center gap-2">
            @if (gameStatus() === 'X') {
              <img [src]="iconX" alt="x" width="64" height="64" />
              <h2 class="text-preset-1">Takes the round</h2>
            } @else if (gameStatus() === 'O') {
              <img [src]="iconO" alt="o" width="64" height="64" />
              <h2 class="text-preset-1">Takes the round</h2>
            } @else if (gameStatus() === 'draw') {
              <span>Draw</span>
            }
          </div>
        </ng-container>

        <ng-container footer>
          <app-button variant="silver" (click)="onQuit()"> Quit </app-button>
          <app-button variant="secondary" (click)="onNextTurn()"> Next Round </app-button>
        </ng-container>
      </app-dialog>
    }

    <main
      class="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center gap-4 px-6 py-8 sm:max-w-md"
    >
      <header class="game-toolbar flex items-center justify-between w-full">
        <img [src]="iconLogo" alt="logo" width="72" height="32" />

        <app-button variant="dark" [disabled]="true">
          @if (currentPlayer() === 'X') {
            <img [src]="iconX" alt="x" width="24" height="24" />
          } @else if (currentPlayer() === 'O') {
            <img [src]="iconO" alt="o" width="24" height="24" />
          } @else {
            <span>?</span>
          }
          <span class="game-turn-text uppercase text-preset-4 text-slate-300 ml-2">Turn</span>
        </app-button>

        <app-button variant="silver" size="icon" (click)="resetGame()"
          ><img [src]="iconReset" alt="reset" width="24" height="24"
        /></app-button>
      </header>
      <div class="game-board grid grid-cols-3 grid-rows-3 gap-4 sm:gap-6 flex-1 w-full">
        @let boardValue = board();
        @for (row of boardValue; track rowIndex; let rowIndex = $index) {
          @for (cell of row; track colIndex; let colIndex = $index) {
            <app-board-cell
              [value]="cell"
              [isWinning]="false"
              [currentPlayer]="currentPlayer()"
              (cellClick)="placeMarker(rowIndex, colIndex)"
            />
          }
        }
      </div>
      <footer class="game-stats flex items-center justify-between gap-4 w-full">
        @for (stat of gameStats(); track stat.key) {
          <div
            class="game-stats-item flex flex-col items-center gap-2 bg-teal-400 rounded-md p-4 flex-1"
            [class.bg-teal-400]="stat.key === 'X'"
            [class.bg-slate-300]="stat.key === 'Tie'"
            [class.bg-amber-400]="stat.key === 'O'"
          >
            <span class="game-stats-item-role text-preset-5 text-slate-900 uppercase">{{
              stat.label
            }}</span>
            <span class="game-stats-item-score text-center text-slate-900 text-preset-2">{{
              stat.score
            }}</span>
          </div>
        }
      </footer>
    </main>
  `,
})
export class GamePage implements OnInit, OnDestroy {
  iconLogo = iconLogo;
  iconO = iconO;
  iconX = iconX;
  iconReset = iconReset;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private gameService = inject(GameService);
  private platformId = inject(PLATFORM_ID);

  private strategySignal = signal<GameModeStrategy | null>(null);

  private gameState = computed(() => this.strategySignal()?.getGameState()() ?? INITIAL_GAME_STATE);
  playerState = computed(() => this.strategySignal()?.getPlayerState()() ?? { mark: '' as const });

  gameStatus = computed(() => this.gameState().gameStatus);
  board = computed(() => this.gameState().board);
  currentPlayer = computed(() => this.gameState().currentPlayer);
  isGameOver = computed(() => this.gameStatus() !== null);

  isMultiplayer = computed(() => !!this.route.snapshot.paramMap.get('roomId'));
  playerCount = computed(() => this.strategySignal()?.getPlayerCount?.()() ?? 2);
  isWaitingForOpponent = computed(() => this.isMultiplayer() && this.playerCount() < 2);

  async ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    const roomId = this.route.snapshot.paramMap.get('roomId');
    const difficulty = (this.route.snapshot.queryParamMap.get('difficulty') ?? 'hard') as
      | 'easy'
      | 'medium'
      | 'hard';

    const strategy = roomId
      ? new MultiplayerStrategy(roomId)
      : new SinglePlayerStrategy(this.gameService, difficulty);

    this.strategySignal.set(strategy);
    await strategy.init();
  }

  ngOnDestroy() {
    this.strategySignal()?.destroy();
  }

  onNextTurn() {
    this.strategySignal()?.onNextTurn();
  }

  onQuit() {
    this.strategySignal()?.onReset();
    this.router.navigate(['/']);
  }

  resetGame() {
    this.strategySignal()?.onReset();
  }

  placeMarker(row: number, col: number) {
    this.strategySignal()?.onPlayerMove(row, col);
  }

  gameStats = computed<GameStat[]>(() => {
    const { gameStats } = this.gameState();
    const playerMark = this.playerState().mark;
    const opponentLabel = this.isMultiplayer() ? 'P2' : 'CPU';

    return [
      { key: 'X', label: `X (${playerMark === 'X' ? 'You' : opponentLabel})`, score: gameStats.X },
      { key: 'Tie', label: 'Ties', score: gameStats.Tie },
      { key: 'O', label: `O (${playerMark === 'O' ? 'You' : opponentLabel})`, score: gameStats.O },
    ];
  });
}
