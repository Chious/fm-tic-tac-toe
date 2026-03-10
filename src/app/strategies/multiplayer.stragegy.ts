import { Signal, signal } from '@angular/core';
import {
  GameState,
  INITIAL_BOARD,
  Mark,
  PlayerState,
} from '@app/services/game-service';
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
 * State is owned by this strategy and updated via WebSocket messages from server.
 * GameService is NOT used here — server is the source of truth.
 *
 * @export
 * @class MultiplayerStrategy
 * @implements {GameModeStrategy}
 */
export class MultiplayerStrategy implements GameModeStrategy {
  private _gameState = signal<GameState>(INITIAL_GAME_STATE);
  private _playerState = signal<PlayerState>(INITIAL_PLAYER_STATE);

  // TODO(multiplayer): 替換成實際 Colyseus Client
  // private client = new Client('ws://localhost:4000');
  // private room?: Room;

  constructor(private roomId: string) {}

  async init(): Promise<void> {
    // TODO(multiplayer): 連接 Colyseus 房間
    // this.room = await this.client.joinOrCreate('tic-tac-toe', { roomId: this.roomId });

    // TODO(multiplayer): 接收 server 推送的完整 gameState
    // this.room.onMessage('state', (serverState: GameState) => {
    //   this._gameState.set(serverState);
    // });

    // TODO(multiplayer): 接收 server 推送的 playerState（對手加入後確定 mark）
    // this.room.onMessage('playerState', (state: PlayerState) => {
    //   this._playerState.set(state);
    // });

    console.warn(`[MultiplayerStrategy] roomId=${this.roomId} — Colyseus not yet implemented`);
  }

  destroy(): void {
    // TODO(multiplayer): 離開房間
    // this.room?.leave();
  }

  getGameState(): Signal<GameState> {
    return this._gameState.asReadonly();
  }

  getPlayerState(): Signal<PlayerState> {
    return this._playerState.asReadonly();
  }

  onPlayerMove(row: number, col: number): void {
    // TODO(multiplayer): 透過 WebSocket 傳送落子，由 server 廣播後 onMessage 更新 _gameState
    // this.room?.send('move', { row, col });

    // Hard code: 直接更新本地 state（待 Colyseus 實作後移除）
    const state = this._gameState();
    if (state.gameStatus !== null) return;
    if (state.board[row][col] !== '') return;

    const newBoard = state.board.map((r, ri) =>
      r.map((cell, ci) => (ri === row && ci === col ? state.currentPlayer : cell)),
    );
    const nextPlayer: Mark = state.currentPlayer === 'X' ? 'O' : 'X';

    this._gameState.set({ ...state, board: newBoard, currentPlayer: nextPlayer });
  }

  onNextTurn(): void {
    // TODO(multiplayer): 通知 server 進入下一輪
    // this.room?.send('next-turn');

    const current = this._gameState();
    const nextPlayer: Mark = current.currentPlayer === 'X' ? 'O' : 'X';
    this._gameState.set({
      ...INITIAL_GAME_STATE,
      currentPlayer: nextPlayer,
      gameStats: current.gameStats,
    });
  }

  onReset(): void {
    // TODO(multiplayer): 通知 server 重置房間
    // this.room?.send('reset');

    this._gameState.set({ ...INITIAL_GAME_STATE });
  }
}
