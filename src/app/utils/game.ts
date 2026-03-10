import { Mark } from '@app/services/game-service';

type GameResult = { gameStatus: 'X' | 'O' | 'draw' | null; winner: Mark | null };

export const checkWin = (board: Mark[][]): GameResult => {
  const n = board.length;

  const checkLine = (cells: Mark[]): GameResult => {
    if (cells[0] && cells.every((cell) => cell === cells[0]))
      return { gameStatus: cells[0] as 'X' | 'O', winner: cells[0] };
    return { gameStatus: null, winner: null };
  };

  // 1. 橫 (rows)
  for (let r = 0; r < n; r++) {
    const result = checkLine(board[r]);
    if (result.gameStatus) return result;
  }

  // 2. 直 (columns)
  for (let c = 0; c < n; c++) {
    const result = checkLine(board.map((row) => row[c]));
    if (result.gameStatus) return result;
  }

  // 3. 左斜 (top-left → bottom-right diagonal)
  const diagLeft = checkLine(board.map((row, i) => row[i]));
  if (diagLeft.gameStatus) return diagLeft;

  // 3. 右斜 (top-right → bottom-left diagonal)
  const diagRight = checkLine(board.map((row, i) => row[n - 1 - i]));
  if (diagRight.gameStatus) return diagRight;

  // Draw: board full, no winner
  const isFull = board.every((row) => row.every((cell) => cell !== ''));
  if (isFull) return { gameStatus: 'draw', winner: null };

  return { gameStatus: null, winner: null };
};
