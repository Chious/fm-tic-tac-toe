import { Schema, MapSchema, ArraySchema, type } from '@colyseus/schema';

export class Player extends Schema {
  @type('string') mark: string = '';
  @type('string') sessionId: string = '';
  @type('boolean') connected: boolean = true;
}

export class TicTacToeState extends Schema {
  // A flat 9-cell array is the easiest to manage and sync
  @type(['string']) board = new ArraySchema<string>('', '', '', '', '', '', '', '', '');

  @type('string') startingPlayer: string = 'X';
  @type('string') currentPlayer: string = 'X';
  @type('string') gameStatus: string = ''; // 'X', 'O', 'draw', 'Opponent Disconnected', or empty string
  @type('boolean') isPlaying: boolean = false;

  @type('number') statsX: number = 0;
  @type('number') statsO: number = 0;
  @type('number') statsTie: number = 0;

  @type({ map: Player }) players = new MapSchema<Player>();
}
