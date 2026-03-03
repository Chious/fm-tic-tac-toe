# Tic Tac Toe Game

## Overview

A Tic Tac Toe game built with Angular and Tailwind CSS.

## Features

- [ ] Single player mode
- [ ] Multiplayer mode
- [ ] Save game state in the browser
- [ ] Instead of having the computer randomly make their moves, try making it clever so it’s proactive in blocking your moves and trying to win

## Routing

### Client-side routing

- `/` - Menu Page, choose to play with CPU or with a friend
- `/game/single` - Single player game page
- `/game/multi/[roomId]` - Multiplayer game page

### Server

- `/api/game` - Game API, for creating and joining rooms
- `/api/game/[roomId]` - Game API, for getting and updating the game state

#### WebSocket API

Join a room:

```typescript
ws.send(
  JSON.stringify({
    type: 'join',
    roomId: '123',
  }),
);
```

Update game state:

```typescript
ws.send(
  JSON.stringify({
    type: 'update',
    roomId: '123',
    gameState: {
      board: ['X', 'O', 'X', 'O', 'X', 'O', 'X', 'O', 'X'],
      currentPlayer: 'X',
    },
  }),
);
```
