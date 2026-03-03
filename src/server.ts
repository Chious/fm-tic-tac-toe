import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

// TODO(multiplayer): 安裝 Colyseus 並初始化 Server
// import { Server } from 'colyseus';
// import { createServer } from 'node:http';
// const httpServer = createServer(app);
// const gameServer = new Server({ server: httpServer });

// TODO(multiplayer): 定義 TicTacToeRoom（繼承自 Colyseus Room）
// 負責管理房間內的 gameState schema 與玩家的 join/leave/message 事件
// gameServer.define('tic-tac-toe', TicTacToeRoom);

/**
 * TODO(multiplayer): REST API 端點（參考 PRD /api/game）
 *
 * POST /api/game        - 建立新房間，回傳 roomId
 * GET  /api/game/:roomId - 取得房間目前的 gameState
 *
 * Example:
 * ```ts
 * app.post('/api/game', async (req, res) => {
 *   const room = await gameServer.createRoom('tic-tac-toe', {});
 *   res.json({ roomId: room.roomId });
 * });
 *
 * app.get('/api/game/:roomId', async (req, res) => {
 *   const room = await gameServer.getRoomById(req.params.roomId);
 *   res.json(room?.state ?? null);
 * });
 * ```
 *
 * WebSocket 事件（由 Colyseus Room 處理，非 Express 路由）：
 * - type: 'join'   → 加入房間，傳入 { roomId }
 * - type: 'update' → 更新棋盤，傳入 { roomId, gameState: { board, currentPlayer } }
 */

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) => (response ? writeResponseToNodeResponse(response, res) : next()))
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  // TODO(multiplayer): 將 app.listen 替換為 httpServer.listen，讓 Colyseus WebSocket 與 Express 共用同一個 port
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
