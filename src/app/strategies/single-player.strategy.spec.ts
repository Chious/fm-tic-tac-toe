import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GameService, GameState, INITIAL_BOARD } from '@app/services/game-service';
import { SinglePlayerStrategy } from './single-player.strategy';

const STORAGE_KEY = 'fm-ttt:single-player:stats';

const makeGameState = (overrides: Partial<GameState> = {}): GameState => ({
  board: INITIAL_BOARD,
  startingPlayer: 'X',
  currentPlayer: 'X',
  gameStatus: null,
  gameStats: { X: 0, O: 0, Tie: 0 },
  ...overrides,
});

describe('SinglePlayerStrategy', () => {
  let gameService: GameService;

  const buildStrategy = (difficulty: 'easy' | 'medium' | 'hard' = 'hard') => {
    return TestBed.runInInjectionContext(
      () => new SinglePlayerStrategy(gameService, difficulty),
    );
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: 'browser' }],
    });
    gameService = TestBed.inject(GameService);
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  describe('init', () => {
    it('sets startingPlayer to the player mark', () => {
      gameService.setPlayerMark('X');
      const strategy = buildStrategy();
      strategy.init();
      expect(gameService.getGameState()().startingPlayer).toBe('X');
    });

    it('does not trigger bot move when player goes first (player = X, starts = X)', () => {
      gameService.setPlayerMark('X');
      const strategy = buildStrategy();
      const spy = vi.spyOn(gameService, 'setProcessing');
      strategy.init();
      expect(spy).not.toHaveBeenCalled();
    });

    it('restores stats from localStorage when playerMark matches', () => {
      gameService.setPlayerMark('X');
      const stored = { playerMark: 'X', gameStats: { X: 3, O: 1, Tie: 2 } };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));

      const spy = vi.spyOn(gameService, 'restoreStats');
      const strategy = buildStrategy();
      strategy.init();

      expect(spy).toHaveBeenCalledWith({ X: 3, O: 1, Tie: 2 });
    });

    it('does not restore stats when playerMark does not match', () => {
      gameService.setPlayerMark('O');
      const stored = { playerMark: 'X', gameStats: { X: 3, O: 1, Tie: 2 } };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));

      const spy = vi.spyOn(gameService, 'restoreStats');
      const strategy = buildStrategy();
      strategy.init();

      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('destroy', () => {
    it('saves current stats to localStorage', () => {
      gameService.setPlayerMark('X');
      gameService.restoreStats({ X: 2, O: 0, Tie: 1 });

      const strategy = buildStrategy();
      strategy.destroy();

      const raw = localStorage.getItem(STORAGE_KEY);
      expect(raw).not.toBeNull();
      const saved = JSON.parse(raw!);
      expect(saved.playerMark).toBe('X');
      expect(saved.gameStats).toEqual({ X: 2, O: 0, Tie: 1 });
    });
  });

  describe('onPlayerMove', () => {
    it('does nothing when it is not the player turn', () => {
      gameService.setPlayerMark('X');
      // Manually set currentPlayer to O so it is bot's turn
      gameService.setStartingPlayer('O');

      const spy = vi.spyOn(gameService, 'makeMove');
      const strategy = buildStrategy();
      strategy.onPlayerMove(0, 0);
      expect(spy).not.toHaveBeenCalled();
    });

    it('does not call onBotMove when game ends after player move', async () => {
      vi.useFakeTimers();
      gameService.setPlayerMark('X');
      gameService.setStartingPlayer('X');
      // Set up a board where X wins on next move at [0][2]
      gameService.makeMove(0, 0); // X
      gameService.makeMove(1, 0); // O
      gameService.makeMove(0, 1); // X
      gameService.makeMove(1, 1); // O
      // currentPlayer is X again, one more move wins

      const setProcessingSpy = vi.spyOn(gameService, 'setProcessing');
      const strategy = buildStrategy();
      strategy.onPlayerMove(0, 2); // X wins → gameStatus = 'X'

      await vi.runAllTimersAsync();
      // setProcessing(true) should never have been called since game is over
      expect(setProcessingSpy).not.toHaveBeenCalledWith(true);
      vi.useRealTimers();
    });

    it('calls makeMove and triggers bot move on a normal player turn', async () => {
      vi.useFakeTimers();
      gameService.setPlayerMark('X');
      gameService.setStartingPlayer('X');

      const makeSpy = vi.spyOn(gameService, 'makeMove');
      const strategy = buildStrategy();
      strategy.onPlayerMove(0, 0);

      expect(makeSpy).toHaveBeenCalledWith(0, 0);
      await vi.runAllTimersAsync();
      // Bot should also call makeMove
      expect(makeSpy.mock.calls.length).toBeGreaterThan(1);
      vi.useRealTimers();
    });
  });

  describe('onNextTurn', () => {
    it('triggers bot move when next turn starts with bot going first', async () => {
      vi.useFakeTimers();
      // Player is X (startingPlayer = X, currentPlayer = X).
      // nextTurn() flips currentPlayer: X → O.
      // playerMark = 'X', new currentPlayer = 'O' → bot (O) goes first → onBotMove triggered.
      gameService.setPlayerMark('X');
      gameService.setStartingPlayer('X');

      const makeSpy = vi.spyOn(gameService, 'makeMove');
      const strategy = buildStrategy();
      strategy.onNextTurn();

      await vi.runAllTimersAsync();
      expect(makeSpy).toHaveBeenCalled();
      vi.useRealTimers();
    });
  });
});
