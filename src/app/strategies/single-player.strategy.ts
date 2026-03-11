import { Signal } from '@angular/core';
import { GameService, GameState, Mark, PlayerState } from '@app/services/game-service';
import { Difficulty, getMove } from '@app/utils/bot';
import { GameModeStrategy } from './game-mode.strategy';

const STORAGE_KEY = 'fm-ttt:single-player:v2';

type PersistedState = {
  playerMark: Mark;
  gameState: GameState;
};
/**
 * Single player strategy for the game mode.
 * State is owned by the GameService and persisted in localStorage.
 * GameService is the source of truth.
 *
 * @export
 * @class SinglePlayerStrategy
 * @implements {GameModeStrategy}
 */
export class SinglePlayerStrategy implements GameModeStrategy {
  private isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

  // Arrow function stored as property so the same reference can be removed later
  private readonly onBeforeUnload = () => this.saveState();

  constructor(
    private gameService: GameService,
    private difficulty: Difficulty = 'hard',
  ) {}

  init(): void {
    const playerMark = this.gameService.getPlayerState()().mark;
    this.loadState();

    if (this.isBrowser) {
      window.addEventListener('beforeunload', this.onBeforeUnload);
    }

    // If it is the bot's turn (either fresh start or restored mid-game), kick off its move
    const { currentPlayer, gameStatus } = this.gameService.getGameState()();
    if (gameStatus === null && currentPlayer !== playerMark) {
      this.onBotMove();
    }
  }

  destroy(): void {
    if (this.isBrowser) {
      window.removeEventListener('beforeunload', this.onBeforeUnload);
    }
    this.saveState();
  }

  private loadState(): void {
    if (!this.isBrowser) return;

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const saved = JSON.parse(raw) as PersistedState;
      const playerMark = this.gameService.getPlayerState()().mark;

      // Discard save if the player switched mark since last session
      if (saved.playerMark !== playerMark) return;

      this.gameService.restoreGameState(saved.gameState);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  private saveState(): void {
    if (!this.isBrowser) return;

    const gameState = this.gameService.getGameState()();
    const playerMark = this.gameService.getPlayerState()().mark;

    const data: PersistedState = { playerMark, gameState };
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
