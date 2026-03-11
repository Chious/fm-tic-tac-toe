import { setup, assign } from 'xstate';
import { checkWin } from '@app/utils/game';

export type Mark = 'X' | 'O' | '';

export type GameStatus =
  | 'X'
  | 'O'
  | 'draw'
  | 'Waiting for Reconnection'
  | 'Opponent Disconnected'
  | null;

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
  disconnectionExpiration?: number;
};

// Context is essentially everything from GameState except we exclude disconnectionExpiration
// since it belongs more to multiplayer server state, or we can keep it for compatibility.
export interface GameContext extends GameState {}

type GameEvent =
  | { type: 'MAKE_MOVE'; row: number; col: number }
  | { type: 'NEXT_TURN' }
  | { type: 'RESET_GAME' }
  | { type: 'RESTORE_STATE'; state: GameState }
  | { type: 'SET_STARTING_PLAYER'; mark: Mark };

export const gameMachine = setup({
  types: {
    context: {} as GameContext,
    events: {} as GameEvent,
  },
  actions: {
    applyMove: assign(({ context, event }) => {
      if (event.type !== 'MAKE_MOVE') return context;
      if (context.gameStatus !== null) return context;
      if (context.board[event.row][event.col] !== '') return context;

      const newBoard = context.board.map((r, ri) =>
        r.map((cell, ci) => (ri === event.row && ci === event.col ? context.currentPlayer : cell)),
      );

      const result = checkWin(newBoard);
      const nextPlayer: Mark = context.currentPlayer === 'X' ? 'O' : 'X';

      const stats = { ...context.gameStats };
      if (result.gameStatus === 'X') stats.X++;
      else if (result.gameStatus === 'O') stats.O++;
      else if (result.gameStatus === 'draw') stats.Tie++;

      return {
        board: newBoard,
        currentPlayer: result.gameStatus ? context.currentPlayer : nextPlayer,
        gameStatus: result.gameStatus,
        gameStats: stats,
      };
    }),
    nextTurn: assign(({ context }) => {
      const nextPlayer: Mark = context.currentPlayer === 'X' ? 'O' : 'X';
      return {
        board: INITIAL_BOARD,
        currentPlayer: nextPlayer,
        gameStatus: null,
      };
    }),
    resetGame: assign(({ context }) => {
      return {
        board: INITIAL_BOARD,
        currentPlayer: context.startingPlayer,
        gameStatus: null,
      };
    }),
    restoreState: assign(({ event }) => {
      if (event.type !== 'RESTORE_STATE') return {};
      return event.state;
    }),
    setStartingPlayer: assign(({ context, event }) => {
      if (event.type !== 'SET_STARTING_PLAYER') return context;
      return {
        startingPlayer: event.mark,
        currentPlayer: event.mark,
      };
    }),
  },
  guards: {
    isValidMove: ({ context, event }) => {
      if (event.type !== 'MAKE_MOVE') return false;
      return context.gameStatus === null && context.board[event.row][event.col] === '';
    },
    isGameOver: ({ context }) => context.gameStatus !== null,
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5RQIYFswGIBKBRAygCoDyeA+kQIKG4DaADALqKgAOA9rAJYAuX7AOxYgAHogCsAdgA0IAJ6IAzAE5FAOgAcAJi2rl4gGwHlBgIwAWAL6XZqDJny5CFQpWyEAkgDkA4mQAKADKUAJq42AzMSCAc3HyCwmII5lrmavQZ9Foa9Mq6pvSKsgoIplrWtuhYXrgAGs6EAKrYXpHCsbz8QtFJUsWIWpLqBoaD5irmGpLm5gYVIHZYeI7OPpQAsnRM7ZydCT0SMvKIppKSalIaporGyqankhpWNgtVagAWXLA87ABOcpg2tEOvFuqAkpItKY1IoyuJzNM7ooVAZ+ghBudtLpzAUzPD7s9KhgPl8fv9AaYomxdqDEohzOItOlZncNCZlJDpmitPQ0tlFFMBfDBlo5i9FmpWAAbFByLgCKCYdaUADSuDI62IADUtlSYjSunSEIp4elYYNTMZtLkisd0eJ6Gp+VN6BoRvdFLzrC8BOwIHBhIsdnFDQcEMo0cpHfRHtdpoVjEZCa9iZ9vn8StSQ-twYgzOdRYZIWzlOZeai7YMDOlIaXBmyZgL5hLpbL5VBg3swaIBuMzWUDJJ6KZtMoTNzXWp7pDLRkR7CLM23otiAA3MC-Tu0sNsgsO+gGG6SQyl7mSasx3Se+FTEcab2WIA */
  id: 'game',
  initial: 'playing',
  context: {
    board: INITIAL_BOARD,
    startingPlayer: 'X',
    currentPlayer: 'X',
    gameStatus: null,
    gameStats: { X: 0, O: 0, Tie: 0 },
  },
  on: {
    RESTORE_STATE: {
      actions: 'restoreState',
      target: '.history', // Will resume where it was or evaluate gameover
    },
    SET_STARTING_PLAYER: {
      actions: 'setStartingPlayer',
    },
    NEXT_TURN: {
      actions: 'nextTurn',
      target: '.playing',
    },
    RESET_GAME: {
      actions: 'resetGame',
      target: '.playing',
    },
  },
  states: {
    history: {
      always: [{ guard: 'isGameOver', target: 'gameOver' }, { target: 'playing' }],
    },
    playing: {
      on: {
        MAKE_MOVE: {
          guard: 'isValidMove',
          actions: 'applyMove',
          target: 'history',
        },
      },
    },
    gameOver: {},
  },
});
