import { Signal } from '@angular/core';
import { GameService, GameState, GameStats, PlayerState } from '@app/services/game-service';
import { Difficulty, getMove } from '@app/utils/bot';
import { GameModeStrategy } from './game-mode.strategy';

const STORAGE_KEY = 'fm-ttt:single-player:stats';

type PersistedState = {
  playerMark: string;
  gameStats: GameStats;
};

export class SinglePlayerStrategy implements GameModeStrategy {
  private isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

  constructor(
    private gameService: GameService,
    private difficulty: Difficulty = 'hard',
  ) {}

  init(): void {
    const playerMark = this.gameService.getPlayerState()().mark;

    this.gameService.setStartingPlayer(playerMark);
    this.loadStats();

    // If bot holds the first turn, kick off its move immediately
    if (this.gameService.getGameState()().currentPlayer !== playerMark) {
      this.onBotMove();
    }
  }

  destroy(): void {
    this.saveStats();
  }

  private loadStats(): void {
    if (!this.isBrowser) return;

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const saved = JSON.parse(raw) as PersistedState;
      const playerMark = this.gameService.getPlayerState()().mark;

      if (saved.playerMark !== playerMark) return;

      this.gameService.restoreStats(saved.gameStats);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  private saveStats(): void {
    if (!this.isBrowser) return;

    const { gameStats } = this.gameService.getGameState()();
    const playerMark = this.gameService.getPlayerState()().mark;

    const data: PersistedState = { playerMark, gameStats };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  getGameState(): Signal<GameState> {
    return this.gameService.getGameState();
  }

  getPlayerState(): Signal<PlayerState> {
    return this.gameService.getPlayerState();
  }

  onPlayerMove(row: number, col: number): void {
    const state = this.gameService.getGameState()();
    if (state.currentPlayer !== this.gameService.getPlayerState()().mark) return;

    this.gameService.makeMove(row, col);

    if (this.gameService.getGameState()().gameStatus === null) {
      this.onBotMove();
    }
  }

  onNextTurn(): void {
    this.gameService.nextTurn();

    const { currentPlayer } = this.gameService.getGameState()();
    const playerMark = this.gameService.getPlayerState()().mark;

    if (currentPlayer !== playerMark) {
      this.onBotMove();
    }
  }

  onReset(): void {
    this.gameService.resetGame();
  }

  private async onBotMove(): Promise<void> {
    this.gameService.setProcessing(true);

    await new Promise((resolve) => setTimeout(resolve, 500));

    const state = this.gameService.getGameState()();

    // Release the lock before makeMove, which guards against isProcessing
    this.gameService.setProcessing(false);

    const botMark = state.currentPlayer;
    const move = getMove(state.board, botMark, this.difficulty);

    if (move) {
      this.gameService.makeMove(move.row, move.col);
    }
  }
}
