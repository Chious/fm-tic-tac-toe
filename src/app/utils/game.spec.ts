import { describe, expect, it } from 'vitest';
import { checkWin } from './game';
import { Mark } from '@app/services/game-service';

const b = (rows: string[][]): Mark[][] => rows as Mark[][];

describe('checkWin', () => {
  it('detects a row win for X', () => {
    const board = b([
      ['X', 'X', 'X'],
      ['O', 'O', ''],
      ['', '', ''],
    ]);
    const result = checkWin(board);
    expect(result.gameStatus).toBe('X');
    expect(result.winner).toBe('X');
  });

  it('detects a row win for O', () => {
    const board = b([
      ['X', 'X', ''],
      ['O', 'O', 'O'],
      ['X', '', ''],
    ]);
    expect(checkWin(board).gameStatus).toBe('O');
  });

  it('detects a column win', () => {
    const board = b([
      ['X', 'O', ''],
      ['X', 'O', ''],
      ['X', '', ''],
    ]);
    expect(checkWin(board).gameStatus).toBe('X');
  });

  it('detects a left diagonal win', () => {
    const board = b([
      ['O', 'X', 'X'],
      ['X', 'O', ''],
      ['X', '', 'O'],
    ]);
    expect(checkWin(board).gameStatus).toBe('O');
  });

  it('detects a right diagonal win', () => {
    const board = b([
      ['O', 'X', 'X'],
      ['O', 'X', ''],
      ['X', '', 'O'],
    ]);
    expect(checkWin(board).gameStatus).toBe('X');
  });

  it('returns draw when board is full with no winner', () => {
    const board = b([
      ['X', 'O', 'X'],
      ['X', 'X', 'O'],
      ['O', 'X', 'O'],
    ]);
    expect(checkWin(board).gameStatus).toBe('draw');
    expect(checkWin(board).winner).toBeNull();
  });

  it('returns null when game is still in progress', () => {
    const board = b([
      ['X', 'O', ''],
      ['', 'X', ''],
      ['O', '', ''],
    ]);
    const result = checkWin(board);
    expect(result.gameStatus).toBeNull();
    expect(result.winner).toBeNull();
  });

  it('returns null for an empty board', () => {
    const board = b([
      ['', '', ''],
      ['', '', ''],
      ['', '', ''],
    ]);
    expect(checkWin(board).gameStatus).toBeNull();
  });
});
