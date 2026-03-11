import { Injectable, signal, computed } from '@angular/core';
import { createActor } from 'xstate';
import { gameMachine, GameContext, GameState, GameStats, Mark, INITIAL_BOARD, GameStatus } from '@app/machines/game.machine';

export type { GameState, GameStats, Mark, GameStatus };
export { INITIAL_BOARD };

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

  private actor = createActor(gameMachine).start();

  // We maintain a signal that reflects the actor's context
  private readonly _gameState = signal<GameContext>(this.actor.getSnapshot().context);

  private isProcessing = signal(false);

  constructor() {
    this.actor.subscribe((state) => {
      this._gameState.set(state.context);
    });
  }

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
    this.actor.send({ type: 'SET_STARTING_PLAYER', mark });
  }

  restoreStats(gameStats: GameStats) {
    const currentContext = this.actor.getSnapshot().context;
    this.actor.send({
      type: 'RESTORE_STATE',
      state: { ...currentContext, gameStats },
    });
  }

  restoreGameState(state: GameState) {
    this.actor.send({
      type: 'RESTORE_STATE',
      state,
    });
  }

  setProcessing(value: boolean) {
    this.isProcessing.set(value);
  }

  makeMove(row: number, col: number) {
    if (this.isProcessing()) return;
    this.actor.send({ type: 'MAKE_MOVE', row, col });
  }

  nextTurn() {
    this.actor.send({ type: 'NEXT_TURN' });
    this.isProcessing.set(false);
  }

  resetGame() {
    this.actor.send({ type: 'RESET_GAME' });
    this.isProcessing.set(false);
  }
}
