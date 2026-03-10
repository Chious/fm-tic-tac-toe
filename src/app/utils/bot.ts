import { Mark } from '@app/services/game-service';
import { checkWin } from './game';

export type Difficulty = 'easy' | 'medium' | 'hard';

type Move = { row: number; col: number };

const getEmptyCells = (board: Mark[][]): Move[] => {
  const cells: Move[] = [];
  board.forEach((r, ri) =>
    r.forEach((cell, ci) => {
      if (cell === '') cells.push({ row: ri, col: ci });
    }),
  );
  return cells;
};

const evaluate = (board: Mark[][], botMark: Mark): number => {
  const result = checkWin(board);
  if (result.gameStatus === botMark) return 10;
  if (result.gameStatus !== null && result.gameStatus !== 'draw') return -10;
  return 0;
};

// Source: https://ithelp.ithome.com.tw/articles/10353229
const minimax = (
  board: Mark[][],
  depth: number,
  isMaximizing: boolean,
  botMark: Mark,
  playerMark: Mark,
): number => {
  const score = evaluate(board, botMark);
  const emptyCells = getEmptyCells(board);

  if (score === 10) return score - depth;
  if (score === -10) return score + depth;
  if (emptyCells.length === 0) return 0;

  if (isMaximizing) {
    let best = -Infinity;
    for (const cell of emptyCells) {
      const newBoard = board.map((r, ri) =>
        r.map((c, ci) => (ri === cell.row && ci === cell.col ? botMark : c)),
      );
      best = Math.max(best, minimax(newBoard, depth + 1, false, botMark, playerMark));
    }
    return best;
  } else {
    let best = Infinity;
    for (const cell of emptyCells) {
      const newBoard = board.map((r, ri) =>
        r.map((c, ci) => (ri === cell.row && ci === cell.col ? playerMark : c)),
      );
      best = Math.min(best, minimax(newBoard, depth + 1, true, botMark, playerMark));
    }
    return best;
  }
};

const getBestMove = (board: Mark[][], botMark: Mark): Move | null => {
  const playerMark: Mark = botMark === 'X' ? 'O' : 'X';
  const emptyCells = getEmptyCells(board);
  if (emptyCells.length === 0) return null;

  let bestScore = -Infinity;
  let bestMove: Move | null = null;

  for (const cell of emptyCells) {
    const newBoard = board.map((r, ri) =>
      r.map((c, ci) => (ri === cell.row && ci === cell.col ? botMark : c)),
    );
    const score = minimax(newBoard, 0, false, botMark, playerMark);
    if (score > bestScore) {
      bestScore = score;
      bestMove = cell;
    }
  }

  return bestMove;
};

const getRandomMove = (board: Mark[][]): Move | null => {
  const emptyCells = getEmptyCells(board);
  if (emptyCells.length === 0) return null;
  return emptyCells[Math.floor(Math.random() * emptyCells.length)];
};

// Probability of picking bestMove per difficulty:
// easy: 20%, medium: 60%, hard: 100%
const BEST_MOVE_PROBABILITY: Record<Difficulty, number> = {
  easy: 0.2,
  medium: 0.6,
  hard: 1.0,
};

export const getMove = (board: Mark[][], botMark: Mark, difficulty: Difficulty): Move | null => {
  const useBestMove = Math.random() < BEST_MOVE_PROBABILITY[difficulty];

  if (useBestMove) {
    return getBestMove(board, botMark);
  }

  return getRandomMove(board);
};
