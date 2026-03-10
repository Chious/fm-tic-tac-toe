import { Signal, signal } from '@angular/core';
import { Client, Room } from 'colyseus.js';
import {
  GameState,
  INITIAL_BOARD,
  Mark,
  PlayerState,
} from '@app/services/game-service';
import { GameModeStrategy } from './game-mode.strategy';

const COLYSEUS_SERVER_URL = 'ws://localhost:2567';

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

  // TODO(multiplayer): 替換成實際 Colyseus Client
  // private client = new Client(COLYSEUS_SERVER_URL);
  // private room?: Room;

  constructor(private roomId: string) {}

  async init(): Promise<void> {
    // TODO(multiplayer): 連接 Colyseus 房間（用 joinById，roomId 由 POST /api/game 取得）
    // this.room = await this.client.joinById(this.roomId);

    // TODO(multiplayer): 接收 server 推送的 playerState（加入後確定自己的 mark）
    // this.room.onMessage('playerState', (state: PlayerState) => {
    //   this._playerState.set(state);
    // });

    // TODO(multiplayer): 接收 server Schema 自動同步，轉換 flat board → 2D + gameStatus
    // this.room.onStateChange((serverState) => {
    //   this._gameState.set(this.toGameState(serverState));
    // });

    console.warn(`[MultiplayerStrategy] roomId=${this.roomId} — Colyseus not yet connected`);
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
    // TODO(multiplayer): 傳送落子給 server，等待 onStateChange 更新畫面
    // this.room?.send('move', { row, col });
  }

  onNextTurn(): void {
    // TODO(multiplayer): 通知 server 進入下一輪
    // this.room?.send('next-turn');
  }

  onReset(): void {
    // TODO(multiplayer): 通知 server 重置房間
    // this.room?.send('reset');
  }

  // TODO(multiplayer): 將 Colyseus Schema state 轉換為 Angular GameState
  // Server state 差異：
  //   - board 是 flat ArraySchema<string>[9]，需重組為 Mark[][]
  //   - gameStatus 是 string（'' 代表 null）
  //   - stats 欄位為 statsX / statsO / statsTie
  //
  // private toGameState(serverState: { ... }): GameState {
  //   const flat = Array.from(serverState.board) as Mark[];
  //   const board: Mark[][] = [
  //     [flat[0], flat[1], flat[2]],
  //     [flat[3], flat[4], flat[5]],
  //     [flat[6], flat[7], flat[8]],
  //   ];
  //   return {
  //     board,
  //     startingPlayer: serverState.startingPlayer as Mark,
  //     currentPlayer: serverState.currentPlayer as Mark,
  //     gameStatus: serverState.gameStatus === '' ? null : serverState.gameStatus as 'X' | 'O' | 'draw',
  //     gameStats: { X: serverState.statsX, O: serverState.statsO, Tie: serverState.statsTie },
  //   };
  // }
}
