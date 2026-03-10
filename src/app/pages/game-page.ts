import { Component, computed, inject, signal } from '@angular/core';
import iconLogo from '@assets/logo.svg';
import iconO from '@assets/icon-o.svg';
import iconX from '@assets/icon-x.svg';
import iconReset from '@assets/icon-restart.svg';
import { BoardCell } from '@app/components/board-cell';
import { Button } from '@app/components/button';
import { GameService } from '@app/services/game-service';
import { Dialog } from '@app/components/dialog';

type StatKey = 'X' | 'O' | 'Tie';
interface GameStat {
  key: StatKey;
  label: string;
  score: number;
}

@Component({
  selector: 'app-game-page',
  imports: [BoardCell, Button, Dialog],
  template: `
    @if (isGameOver()) {
      <app-dialog></app-dialog>
    }

    <main
      class="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center gap-4 px-6 py-8 sm:max-w-md"
    >
      <header class="game-toolbar flex items-center justify-between w-full">
        <img class="game-logo" [src]="iconLogo" alt="logo" class="h-full w-auto" />

        <app-button variant="dark" disabled>
          <img [src]="iconX" alt="x" width="24" height="24" />
          <span class="game-turn-text uppercase text-preset-4 text-slate-300 ml-2">Turn</span>
        </app-button>

        <app-button variant="silver" size="icon"
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
      <!-- TODO(game-over-dialog): 遊戲結束時顯示 Dialog
    - 顯示贏家（X 贏 / O 贏 / 平局）及對應文字（You Won! / You Lost! / Draw!）
    - 提供「下一輪」按鈕：保留 gameStats 分數，僅重置棋盤與 currentPlayer
    - 提供「返回選單」按鈕：完整 reset，導回 /
  -->
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
export class GamePage {
  iconLogo = iconLogo;
  iconO = iconO;
  iconX = iconX;
  iconReset = iconReset;

  private gameService = inject(GameService);

  playerState = this.gameService.getPlayerState();
  private gameState = this.gameService.getGameState();

  board = computed(() => this.gameState().board);
  currentPlayer = computed(() => this.gameState().currentPlayer);

  isGameOver = signal<boolean>(false); //TODO: compute by gameService

  placeMarker(row: number, col: number) {
    // TODO(bot-logic): 單人模式下，若非玩家回合（currentPlayer !== playerState.mark）則忽略點擊
    // TODO(multiplayer): 多人模式下，改為透過 Colyseus WebSocket 傳送落子事件，不直接呼叫 gameService
    this.gameService.placeMarker(row, col);
    // TODO(bot-logic): 單人模式下，落子後若遊戲未結束，觸發 CPU 自動落子（Minimax 或隨機）
  }

  gameStats = computed<GameStat[]>(() => {
    const { gameStats } = this.gameState();
    const playerMark = this.playerState().mark;
    const cpuMark = playerMark === 'X' ? 'O' : 'X';

    return [
      { key: 'X', label: `X (${playerMark === 'X' ? 'You' : 'CPU'})`, score: gameStats.X },
      { key: 'Tie', label: 'Ties', score: gameStats.Tie },
      { key: 'O', label: `O (${cpuMark === 'O' ? 'CPU' : 'You'})`, score: gameStats.O },
    ];
  });
}
