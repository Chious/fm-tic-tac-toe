# Tic-Tac-Toe Server API & WebSocket 說明文件

本文件描述了前端應如何與 Colyseus 多人遊戲伺服器進行互動。伺服器預設運行在 `http://localhost:2567` (或是您的 Docker 容器對外開的 Port)。

---

## 1. REST API 端點

### 建立新房間 (Room)

建立一個新的「圈圈叉叉 (Tic-Tac-Toe)」遊戲房間。

*   **URL:** `/api/game`
*   **Method:** `POST`
*   **Success Response:**
    *   **Code:** 200 OK
    *   **Content:**
        ```json
        {
          "roomId": "aB3cDeF"
        }
        ```
*   **用途 / 用法:**
    開發者應在前端呼叫此 API，取得新建立的 `roomId` 後，再指示客戶端透過 WebSocket 連接至此特定的 `roomId`（例如引導至路徑 `/game/multi/aB3cDeF`）。

---

## 2. WebSocket 端點 (Colyseus Client)

伺服器使用 Colyseus 框架。客戶端不應透過原生 WebSocket 溝通，而應該透過 `colyseus.js` 套件。

### 連線與加入房間

使用 REST API 取得 `roomId` 後，使用 Colyseus 客戶端加入房間：

```typescript
import { Client } from 'colyseus.js';

const client = new Client('ws://localhost:2567');

// 根據 roomId 加入房間
// 也可以在後面帶入客製化選項，例如期望的符號
const room = await client.joinById(roomId, { mark: 'X' });
```

> **注意：** 第一位進入房間的玩家可以優先選擇 `mark` ('X' 或 'O')，第二位玩家將自動被分配剩下的符號。

---

### 3. State Schema (遊戲狀態)

當客戶端加入 `room` 後，會接收到初始的 state 以及後續的同步狀態變更。您可透過 `room.onStateChange` 來監聽。

狀態樹 (`room.state`) 包含以下屬性：

| 屬性名稱 | 類型 | 預設值 | 說明 |
| :--- | :--- | :--- | :--- |
| `board` | `ArrayString` | `['', '', '', '', '', '', '', '', '']` | 長度為 9 的一維陣列。<br>`''` 代表空，否則為 `'X'` 或 `'O'`。對應棋盤左上至右下。 |
| `startingPlayer` | `string` | `'X'` | 記錄該局最一開始是誰下的。每新開一局會輪替。 |
| `currentPlayer` | `string` | `'X'` | 標示當下輪到誰下棋 ('X' 或 'O')。 |
| `gameStatus` | `string` | `''` | 遊戲狀態指示器。<br>`''`: 遊戲進行中<br>`'X'`: X 獲勝<br>`'O'`: O 獲勝<br>`'draw'`: 平手<br>`'Opponent Disconnected'`: 對手斷線 |
| `isPlaying` | `boolean` | `false` | 標示遊戲是否進行中（必須湊滿 2 人才會變成 `true`）。 |
| `statsX` | `number` | `0` | 玩家 X 勝場數 |
| `statsO` | `number` | `0` | 玩家 O 勝場數 |
| `statsTie` | `number` | `0` | 平手局數 |
| `players` | `MapSchema<Player>` | | 玩家連線與分配狀態表，可透過 `sessionId` 取出。 |

**Player 屬性 (players map 中的單一項目):**
*   `mark`: `"X"` 或 `"O"`
*   `sessionId`: 客戶端 WebSocket ID
*   `connected`: 是否正保持連線中

---

## 4. 客戶端 -> 伺服器 (Events / Messages)

客戶端要執行動作時，需透過呼叫 `room.send(type, payload)` 傳遞給伺服器：

### `move`：玩家下棋
傳遞二維陣列座標，伺服器會自動轉換檢查。
*   **Payload格式:** `{ row: number, col: number }` (數值皆為 `0`, `1`, `2`)
*   **範例:**
    ```typescript
    room.send('move', { row: 1, col: 1 }); // 下在正中間
    ```

### `next-turn`：下一局
當遊戲結束 (`gameStatus` 不為空且不是斷線) 時，雙方皆可送出此請求準備進入下一回合。伺服器收到後會重置 `board` 並交換起手玩家。
*   **Payload格式:** *(不需要)*
*   **範例:**
    ```typescript
    room.send('next-turn');
    ```

### `reset`：重置所有競賽資料
清空計分板，將一切重制到剛進入遊戲的樣貌。
*   **Payload格式:** *(不需要)*
*   **範例:**
    ```typescript
    room.send('reset');
    ```

---

## 5. 伺服器 -> 客戶端 (Events / Messages)

伺服器會主動推播特定動作給客戶端。客戶端需透過 `room.onMessage` 來註冊監聽。

### `playerState`
在客戶端 (`onJoin`) 成功加入房間的那一瞬間，伺服器會馬上推播一則 `playerState` 訊息給該名客戶端，告訴他分配到的專屬陣營。

*   **接收範例:**
    ```typescript
    room.onMessage('playerState', (state: { mark: 'X' | 'O' }) => {
      console.log('我是陣營:', state.mark);
    });
    ```

---

## 📌 斷線處理 (Reconnection)

如果玩家意外中斷連線 (例如網路斷開)，伺服器會給予 **30秒** 的等待時間，期間 `gameStatus` 不變且遊戲暫停 (`isPlaying` = `false`)。
* 如果在期間內重連成功 `client.reconnect(roomId, sessionId)`，遊戲將自動接續進行。
* 若超過 30 秒沒有回來，剩下的玩家會看到 `gameStatus = 'Opponent Disconnected'`，且遊戲將會隨即結束。
