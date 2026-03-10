import { Room, Client } from '@colyseus/core';
import { TicTacToeState, Player } from './schema/TicTacToeState.js';

export class TicTacToeRoom extends Room<{ state: TicTacToeState }> {
  maxClients = 2; // Strict 2-player limit

  onCreate(options: any) {
    this.setState(new TicTacToeState());

    // Listen for move events from the frontend
    this.onMessage('move', (client, message: { row: number, col: number }) => {
      const player = this.state.players.get(client.sessionId);
      const index = message.row * 3 + message.col;

      // Validation Guards
      if (!this.state.isPlaying) return; // Game hasn't started or is over
      if (!player || player.mark !== this.state.currentPlayer) return; // Not their turn
      if (this.state.board[index] !== '') return; // Cell already taken

      // Apply the move
      this.state.board[index] = player.mark;

      // Evaluate the board state
      if (this.checkWin(player.mark)) {
        this.state.gameStatus = player.mark;
        this.state.isPlaying = false;
        
        if (player.mark === 'X') this.state.statsX++;
        if (player.mark === 'O') this.state.statsO++;
      } else if (this.checkDraw()) {
        this.state.gameStatus = 'draw';
        this.state.isPlaying = false;
        this.state.statsTie++;
      } else {
        // Swap turn
        this.state.currentPlayer = this.state.currentPlayer === 'X' ? 'O' : 'X';
      }
    });

    this.onMessage('next-turn', (client) => {
      // Only proceed if game is over normally
      if (!this.state.isPlaying && this.state.gameStatus !== 'Opponent Disconnected') {
        this.startNextRound();
      }
    });

    this.onMessage('reset', (client) => {
      this.resetGame();
    });
  }

  onJoin(client: Client, options: { mark?: 'X' | 'O' }) {
    const player = new Player();
    player.sessionId = client.sessionId;

    if (this.state.players.size === 0) {
      // First player: honour their requested mark, default to 'X'
      player.mark = options?.mark === 'O' ? 'O' : 'X';
    } else {
      // Second player: receives whichever mark the first player didn't take
      const takenMark = [...this.state.players.values()][0].mark;
      player.mark = takenMark === 'X' ? 'O' : 'X';
    }

    this.state.players.set(client.sessionId, player);
    
    // Tell the client what mark they are
    client.send('playerState', { mark: player.mark });

    // Start the game when the room is full
    if (this.state.players.size === 2) {
      this.state.isPlaying = true;
    }
  }

  /**
   * Unexpected drop (network loss, browser close, etc.).
   * Pause the game and give the player 30 s to reconnect.
   * If the window expires, end the game for the remaining player.
   */
  async onDrop(client: Client, code?: number) {
    const player = this.state.players.get(client.sessionId);
    if (player) {
      player.connected = false;
      this.state.isPlaying = false;
    }

    try {
      await this.allowReconnection(client, 30);
    } catch {
      // Reconnection window expired — remove the player and end the game
      this.state.players.delete(client.sessionId);
      this.state.gameStatus = 'Opponent Disconnected';
    }
  }

  /** Successful reconnect — restore the player and resume the game. */
  onReconnect(client: Client) {
    const player = this.state.players.get(client.sessionId);
    if (!player) return;

    player.connected = true;

    // Only resume if the game had not already ended before the drop
    const allConnected = [...this.state.players.values()].every((p) => p.connected);
    if (allConnected && !this.state.gameStatus) {
      this.state.isPlaying = true;
    }
  }

  /**
   * Consented leave (client called room.leave()).
   * Because onDrop is defined, this is only triggered for deliberate exits.
   */
  onLeave(client: Client, code?: number) {
    this.state.players.delete(client.sessionId);
    this.state.isPlaying = false;
    this.state.gameStatus = 'Opponent Disconnected';
  }

  private checkWin(mark: string): boolean {
    const winPatterns = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8], // Rows
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8], // Cols
      [0, 4, 8],
      [2, 4, 6], // Diagonals
    ];
    return winPatterns.some((pattern) =>
      pattern.every((index) => this.state.board[index] === mark),
    );
  }

  private checkDraw(): boolean {
    return this.state.board.every((cell) => cell !== '');
  }

  private startNextRound() {
    this.state.board.forEach((_, i) => (this.state.board[i] = ''));
    this.state.gameStatus = '';
    
    // Swap whoever starts
    this.state.startingPlayer = this.state.startingPlayer === 'X' ? 'O' : 'X';
    this.state.currentPlayer = this.state.startingPlayer;
    this.state.isPlaying = true;
  }

  private resetGame() {
    this.state.board.forEach((_, i) => (this.state.board[i] = ''));
    this.state.gameStatus = '';
    this.state.startingPlayer = 'X';
    this.state.currentPlayer = 'X';
    this.state.statsX = 0;
    this.state.statsO = 0;
    this.state.statsTie = 0;
    this.state.isPlaying = this.state.players.size === 2;
  }
}
