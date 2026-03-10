import { Injectable, signal } from '@angular/core';
import { checkWin } from '@app/utils/game';

export type Mark = 'X' | 'O' | '';

export type GameStatus = 'X' | 'O' | 'draw' | null;

export const INITIAL_BOARD: Mark[][] = [
  ['', '', ''],
  ['', '', ''],
  ['', '', ''],
];

export type GameStats = {
  X: number;
  O: number;
  Tie: number;
};

export type GameState = {
  board: Mark[][];
  startingPlayer: Mark;
  currentPlayer: Mark;
  gameStatus: GameStatus;
  gameStats: GameStats;
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

  private readonly _gameState = signal<GameState>({
    board: [
      ['', '', ''],
      ['', '', ''],
      ['', '', ''],
    ],
    startingPlayer: 'X',
    currentPlayer: 'X',
    gameStatus: null,
    gameStats: {
      X: 0,
      O: 0,
      Tie: 0,
    },
  });

  private isProcessing = signal(false);

  getPlayerState() {
    return this.playerState.asReadonly();
  }

  setPlayerMark(mark: Mark) {
    this.playerState.set({ mark });
  }

  getGameState() {
    return this._gameState.asReadonly();
  }

  setStartingPlayer(mark: Mark) {
    this._gameState.update((s) => ({
      ...s,
      startingPlayer: mark,
      currentPlayer: mark,
    }));
  }

  restoreStats(gameStats: GameStats) {
    this._gameState.update((s) => ({ ...s, gameStats }));
  }

  restoreGameState(state: GameState) {
    this._gameState.set(state);
  }

  setProcessing(value: boolean) {
    this.isProcessing.set(value);
  }

  makeMove(row: number, col: number) {
    const state = this._gameState();

    if (state.gameStatus !== null) return;
    if (this.isProcessing()) return;
    if (state.board[row][col] !== '') return;

    const newBoard = state.board.map((r, ri) =>
      r.map((cell, ci) => (ri === row && ci === col ? state.currentPlayer : cell)),
    );

    const result = checkWin(newBoard);
    const nextPlayer: Mark = state.currentPlayer === 'X' ? 'O' : 'X';

    this._gameState.update((s) => {
      const stats = { ...s.gameStats };
      if (result.gameStatus === 'X') stats.X++;
      else if (result.gameStatus === 'O') stats.O++;
      else if (result.gameStatus === 'draw') stats.Tie++;

      return {
        ...s,
        board: newBoard,
        currentPlayer: result.gameStatus ? s.currentPlayer : nextPlayer,
        gameStatus: result.gameStatus,
        gameStats: stats,
      };
    });
  }

  nextTurn() {
    const state = this._gameState();
    const nextPlayer: Mark = state.currentPlayer === 'X' ? 'O' : 'X';
    this._gameState.update((s) => ({
      ...s,
      board: INITIAL_BOARD,
      currentPlayer: nextPlayer,
      gameStatus: null,
    }));
    this.isProcessing.set(false);
  }

  resetGame() {
    this._gameState.update((state) => ({
      ...state,
      board: INITIAL_BOARD,
      currentPlayer: state.startingPlayer,
      gameStatus: null,
    }));
    this.isProcessing.set(false);
  }
}
