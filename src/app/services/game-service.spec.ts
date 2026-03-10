import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it } from 'vitest';
import { GameService } from './game-service';

describe('GameService', () => {
  let service: GameService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('makeMove', () => {
    it('updates the board on a valid move', () => {
      service.makeMove(0, 0);
      expect(service.getGameState()().board[0][0]).toBe('X');
    });

    it('switches currentPlayer after a valid move', () => {
      service.makeMove(0, 0);
      expect(service.getGameState()().currentPlayer).toBe('O');
    });

    it('does nothing when the target cell is already occupied', () => {
      service.makeMove(0, 0); // X plays
      service.makeMove(0, 0); // O tries same cell
      expect(service.getGameState()().board[0][0]).toBe('X');
      expect(service.getGameState()().currentPlayer).toBe('O');
    });

    it('does nothing when the game is already over', () => {
      // Force X to win first
      service.makeMove(0, 0); // X
      service.makeMove(1, 0); // O
      service.makeMove(0, 1); // X
      service.makeMove(1, 1); // O
      service.makeMove(0, 2); // X wins
      const boardAfterWin = service.getGameState()().board;

      service.makeMove(2, 2); // should be ignored
      expect(service.getGameState()().board).toEqual(boardAfterWin);
    });

    it('sets gameStatus to the winner and increments stats when X wins', () => {
      service.makeMove(0, 0); // X
      service.makeMove(1, 0); // O
      service.makeMove(0, 1); // X
      service.makeMove(1, 1); // O
      service.makeMove(0, 2); // X wins — row 0
      const state = service.getGameState()();
      expect(state.gameStatus).toBe('X');
      expect(state.gameStats.X).toBe(1);
    });

    it('sets gameStatus to draw when board fills with no winner', () => {
      //   X | O | X
      //   X | X | O
      //   O | X | O   → draw
      service.makeMove(0, 0); // X
      service.makeMove(0, 1); // O
      service.makeMove(0, 2); // X
      service.makeMove(1, 2); // O
      service.makeMove(1, 0); // X
      service.makeMove(2, 0); // O
      service.makeMove(1, 1); // X
      service.makeMove(2, 2); // O
      service.makeMove(2, 1); // X
      const state = service.getGameState()();
      expect(state.gameStatus).toBe('draw');
      expect(state.gameStats.Tie).toBe(1);
    });

    it('does nothing when isProcessing is true', () => {
      service.setProcessing(true);
      service.makeMove(0, 0);
      expect(service.getGameState()().board[0][0]).toBe('');
    });
  });

  describe('resetGame', () => {
    it('clears the board and resets gameStatus', () => {
      service.makeMove(0, 0);
      service.resetGame();
      const state = service.getGameState()();
      expect(state.board.every((row) => row.every((cell) => cell === ''))).toBe(true);
      expect(state.gameStatus).toBeNull();
    });

    it('resets currentPlayer to startingPlayer', () => {
      service.setStartingPlayer('O');
      service.makeMove(0, 0); // O plays, currentPlayer becomes X
      service.resetGame();
      expect(service.getGameState()().currentPlayer).toBe('O');
    });

    it('preserves gameStats across reset', () => {
      service.makeMove(0, 0); // X
      service.makeMove(1, 0); // O
      service.makeMove(0, 1); // X
      service.makeMove(1, 1); // O
      service.makeMove(0, 2); // X wins
      service.resetGame();
      expect(service.getGameState()().gameStats.X).toBe(1);
    });
  });

  describe('nextTurn', () => {
    it('clears the board and flips currentPlayer', () => {
      service.makeMove(0, 0); // X → currentPlayer becomes O
      service.nextTurn();
      const state = service.getGameState()();
      expect(state.board.every((row) => row.every((cell) => cell === ''))).toBe(true);
      expect(state.currentPlayer).toBe('X'); // flipped from O back to X
    });

    it('preserves gameStats', () => {
      service.makeMove(0, 0); // X
      service.makeMove(1, 0); // O
      service.makeMove(0, 1); // X
      service.makeMove(1, 1); // O
      service.makeMove(0, 2); // X wins
      service.nextTurn();
      expect(service.getGameState()().gameStats.X).toBe(1);
    });
  });

  describe('setStartingPlayer', () => {
    it('updates both startingPlayer and currentPlayer', () => {
      service.setStartingPlayer('O');
      const state = service.getGameState()();
      expect(state.startingPlayer).toBe('O');
      expect(state.currentPlayer).toBe('O');
    });
  });

  describe('restoreStats', () => {
    it('updates only gameStats, leaving other fields unchanged', () => {
      service.makeMove(0, 0); // change board
      const boardBefore = service.getGameState()().board;

      service.restoreStats({ X: 5, O: 3, Tie: 1 });

      const state = service.getGameState()();
      expect(state.gameStats).toEqual({ X: 5, O: 3, Tie: 1 });
      expect(state.board).toEqual(boardBefore);
    });
  });
});
