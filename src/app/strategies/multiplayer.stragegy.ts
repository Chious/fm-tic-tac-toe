import { Signal, signal } from '@angular/core';
import { Client, Room } from '@colyseus/sdk';
import { GameState, INITIAL_BOARD, Mark, PlayerState } from '@app/services/game-service';
import { GameModeStrategy } from './game-mode.strategy';

const INITIAL_GAME_STATE: GameState = {
  board: INITIAL_BOARD,
  startingPlayer: 'X',
  currentPlayer: 'X',
  gameStatus: null,
  gameStats: { X: 0, O: 0, Tie: 0 },
};

const INITIAL_PLAYER_STATE: PlayerState = { mark: 'X' };

/**
 * Multiplayer strategy for the game mode.
 * State is owned by the Colyseus server and synced to this strategy via WebSocket.
 * GameService is NOT used here — server is the source of truth.
 *
 * Colyseus server runs separately on port 2567.
 * Room lifecycle: POST /api/game → roomId → navigate to /game/multi/:roomId
 *
 * @export
 * @class MultiplayerStrategy
 * @implements {GameModeStrategy}
 */
export class MultiplayerStrategy implements GameModeStrategy {
  private _gameState = signal<GameState>(INITIAL_GAME_STATE);
  private _playerState = signal<PlayerState>(INITIAL_PLAYER_STATE);
  private _playerCount = signal<number>(0);

  private client = new Client(import.meta.env['NG_APP_COLYSEUS_WS_URL']);
  private room?: Room;

  constructor(private roomId: string) {}

  async init(): Promise<void> {
    try {
      this.room = await this.client.joinById(this.roomId);

      this.room.onMessage('playerState', (state: PlayerState) => {
        this._playerState.set(state);
      });

      this.room.onStateChange((serverState: any) => {
        this._gameState.set(this.toGameState(serverState));
        this._playerCount.set(serverState.players.size);
      });

      console.warn(`[MultiplayerStrategy] roomId=${this.roomId} — Colyseus connected`);
    } catch (e) {
      console.error(`[MultiplayerStrategy] Error joining room ${this.roomId}:`, e);
      // Optional: Handle UI notification or redirect user to home
    }
  }

  destroy(): void {
    this.room?.leave();
  }

  getGameState(): Signal<GameState> {
    return this._gameState.asReadonly();
  }

  getPlayerState(): Signal<PlayerState> {
    return this._playerState.asReadonly();
  }

  getPlayerCount(): Signal<number> {
    return this._playerCount.asReadonly();
  }

  onPlayerMove(row: number, col: number): void {
    this.room?.send('move', { row, col });
  }

  onNextTurn(): void {
    this.room?.send('next-turn');
  }

  onReset(): void {
    this.room?.send('reset');
  }

  private toGameState(serverState: any): GameState {
    const flat = Array.from(serverState.board) as Mark[];
    const board: Mark[][] = [
      [flat[0], flat[1], flat[2]],
      [flat[3], flat[4], flat[5]],
      [flat[6], flat[7], flat[8]],
    ];
    return {
      board,
      startingPlayer: serverState.startingPlayer as Mark,
      currentPlayer: serverState.currentPlayer as Mark,
      gameStatus: serverState.gameStatus === '' ? null : (serverState.gameStatus as any),
      gameStats: { X: serverState.statsX, O: serverState.statsO, Tie: serverState.statsTie },
    };
  }
}
