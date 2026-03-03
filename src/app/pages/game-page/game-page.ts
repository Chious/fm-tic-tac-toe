import { Component, computed, inject, signal } from '@angular/core';
import iconLogo from '@assets/logo.svg';
import iconO from '@assets/icon-o.svg';
import iconX from '@assets/icon-x.svg';
import iconReset from '@assets/icon-restart.svg';
import { BoardCell } from '@app/components/board-cell/board-cell';
import { Button } from '@app/components/button/button';
import { GameService } from '@app/services/game-service';
import { Dialog } from '@app/components/dialog/dialog';

type StatKey = 'X' | 'O' | 'Tie';
interface GameStat {
  key: StatKey;
  label: string;
  score: number;
}

@Component({
  selector: 'app-game-page',
  imports: [BoardCell, Button, Dialog],
  templateUrl: './game-page.html',
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
