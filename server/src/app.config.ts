import {
  defineServer,
  defineRoom,
  matchMaker,
  monitor,
  playground,
  createRouter,
  createEndpoint,
} from 'colyseus';

import { TicTacToeRoom } from './rooms/TicTacToeRoom.js';

const server = defineServer({
  rooms: {
    tic_tac_toe: defineRoom(TicTacToeRoom),
  },

  routes: createRouter({
    /**
     * POST /api/game
     * Creates a new tic_tac_toe room and returns the roomId.
     * Client navigates to /game/multi/:roomId after receiving it.
     */
    create_game: createEndpoint('/api/game', { method: 'POST' }, async (_ctx) => {
      const room = await matchMaker.createRoom('tic_tac_toe', {});
      return { roomId: room.roomId };
    }),
  }),

  express: (app) => {
    app.use('/monitor', monitor());

    if (process.env.NODE_ENV !== 'production') {
      app.use('/', playground());
    }
  },
});

export default server;
