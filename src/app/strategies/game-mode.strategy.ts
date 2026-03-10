import { Signal } from '@angular/core';
import { GameState, PlayerState } from '@app/services/game-service';

/**
 * Interface for the game mode strategy
 *
 * @export
 * @interface GameModeStrategy
 */
export interface GameModeStrategy {
  init(): void | Promise<void>;
  destroy(): void;

  getGameState(): Signal<GameState>;
  getPlayerState(): Signal<PlayerState>;
  getPlayerCount?(): Signal<number>;

  onPlayerMove(row: number, col: number): void;
  onNextTurn(): void;
  onReset(): void;
}
