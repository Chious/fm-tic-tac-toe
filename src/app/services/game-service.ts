import { Injectable, signal } from '@angular/core';

export type Mark = 'X' | 'O' | '';

export type GameState = {
  board: Mark[][];
  currentPlayer: Mark;
  gameStats: {
    X: number;
    O: number;
    Tie: number;
  };
};

export type PlayerState = {
  mark: Mark;
};

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private playerState = signal<PlayerState>({
    mark: 'X',
  });

  private gameState = signal<GameState>({
    board: [
      ['', '', ''],
      ['', '', ''],
      ['', '', ''],
    ],
    currentPlayer: 'X',
    gameStats: {
      X: 0,
      O: 0,
      Tie: 0,
    },
  });

  getPlayerState() {
    return this.playerState.asReadonly();
  }

  setPlayerMark(mark: Mark) {
    this.playerState.set({ mark });
  }

  getGameState() {
    return this.gameState.asReadonly();
  }

  setGameState(state: GameState) {
    this.gameState.set(state);
  }

  placeMarker(row: number, col: number) {
    const state = this.gameState();
    if (state.board[row][col] !== '') return;

    const newBoard = state.board.map((r, ri) =>
      r.map((cell, ci) => (ri === row && ci === col ? state.currentPlayer : cell)),
    );
    const nextPlayer: Mark = state.currentPlayer === 'X' ? 'O' : 'X';

    this.gameState.set({ ...state, board: newBoard, currentPlayer: nextPlayer });

    // TODO(win-check): 落子後檢查是否三連線或平局
    // - 檢查 8 條線（3 橫、3 直、2 斜）
    // - 若有贏家：更新 gameStats[winner]++，emit 遊戲結束事件
    // - 若平局（無空格且無贏家）：更新 gameStats.Tie++，emit 遊戲結束事件
  }

  resetGame() {
    this.gameState.set({
      board: [
        ['', '', ''],
        ['', '', ''],
        ['', '', ''],
      ],
      currentPlayer: 'X',
      gameStats: { X: 0, O: 0, Tie: 0 },
    });
  }
}
