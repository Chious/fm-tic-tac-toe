import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getMove } from './bot';
import { Mark } from '@app/services/game-service';

const b = (rows: string[][]): Mark[][] => rows as Mark[][];

describe('getMove', () => {
  describe('hard difficulty — always picks best move', () => {
    it('takes a winning move when available', () => {
      // Bot is X, can win at [0][2]
      const board = b([
        ['X', 'X', ''],
        ['O', 'O', 'X'],
        ['O', '', ''],
      ]);
      const move = getMove(board, 'X', 'hard');
      expect(move).toEqual({ row: 0, col: 2 });
    });

    it('blocks the player from winning', () => {
      // Bot is X. O has column 1 at (0,1) and (1,1) — wins at (2,1).
      // X has no winning move, so bot must block at (2,1).
      const board = b([
        ['X', 'O', ''],
        ['', 'O', 'X'],
        ['', '', ''],
      ]);
      const move = getMove(board, 'X', 'hard');
      expect(move).toEqual({ row: 2, col: 1 });
    });

    it('returns a valid cell on an empty board', () => {
      const board = b([
        ['', '', ''],
        ['', '', ''],
        ['', '', ''],
      ]);
      const move = getMove(board, 'X', 'hard');
      expect(move).not.toBeNull();
      expect(move!.row).toBeGreaterThanOrEqual(0);
      expect(move!.col).toBeGreaterThanOrEqual(0);
    });

    it('returns null when the board is full', () => {
      const board = b([
        ['X', 'O', 'X'],
        ['X', 'X', 'O'],
        ['O', 'X', 'O'],
      ]);
      expect(getMove(board, 'X', 'hard')).toBeNull();
    });
  });

  describe('easy difficulty — uses random move when Math.random is low', () => {
    beforeEach(() => {
      // Force Math.random to return 0 → below easy threshold (0.2) only when mocked as < 0.2
      // To force the random path, return a value >= BEST_MOVE_PROBABILITY['easy'] (0.2)
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('picks a random empty cell (not necessarily optimal)', () => {
      // Board where only [2][1] and [2][2] are empty — random picks one of them
      const board = b([
        ['X', 'O', 'X'],
        ['O', 'X', 'O'],
        ['O', '', ''],
      ]);
      const move = getMove(board, 'X', 'easy');
      expect(move).not.toBeNull();
      const validCells = [
        { row: 2, col: 1 },
        { row: 2, col: 2 },
      ];
      expect(validCells).toContainEqual(move);
    });
  });
});
