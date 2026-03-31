# Multiplayer WebSocket Protocol

Architecture and message specification for adding real-time multiplayer to Othello.

> **Status**: Documentation only. The engine is ready; a backend server is the missing piece.
> **Constraint**: GitHub Pages hosts static assets only — a WebSocket server must be deployed separately (e.g. Fly.io, Railway, Render free tier).

---

## Architecture Overview

```
Browser A                  Server                  Browser B
   │                         │                         │
   │── CREATE_ROOM ──────────▶│                         │
   │◀─ ROOM_CREATED ──────────│                         │
   │                         │◀────────── JOIN_ROOM ───│
   │◀─ PLAYER_JOINED ─────────│─── PLAYER_JOINED ──────▶│
   │                         │                         │
   │── MAKE_MOVE ────────────▶│                         │
   │◀─ GAME_STATE ────────────│─── GAME_STATE ──────────▶│
   │                         │                         │
   │   (disconnect)          │                         │
   │◀─ OPPONENT_DISCONNECTED ─│─ OPPONENT_DISCONNECTED ─▶│
   │── RECONNECT ────────────▶│                         │
   │◀─ GAME_STATE ────────────│                         │
```

The server is a **thin relay + authority**:

- Validates moves against its own engine instance
- Rejects illegal moves before broadcasting
- Holds canonical game state for reconnection

---

## Message Envelope

Every WebSocket message is a UTF-8 JSON string:

```ts
interface Message {
  type: MessageType; // discriminant
  roomId?: string; // present on all room-scoped messages
  seq?: number; // monotonically increasing per-client (for dedup)
  payload: unknown; // type-specific, see below
}
```

---

## Client → Server Messages

### `CREATE_ROOM`

Create a new room and become the host (Black by default).

```ts
{
  type: 'CREATE_ROOM',
  payload: {
    playerName: string;          // display name
    color?: 'B' | 'W';          // desired color, default 'B'
    timeControl?: {              // optional time control
      initialTime: number;       // ms per player
      increment: number;         // ms added after each move
    };
  }
}
```

### `JOIN_ROOM`

Join an existing room by code.

```ts
{
  type: 'JOIN_ROOM',
  roomId: string;
  payload: {
    playerName: string;
  }
}
```

### `MAKE_MOVE`

Submit a move. Server validates before broadcasting.

```ts
{
  type: 'MAKE_MOVE',
  roomId: string;
  seq: number;
  payload: {
    coordinate: [number, number];  // [col, row], 0-indexed
  }
}
```

### `RECONNECT`

Re-attach to a room after a disconnect. Server replays full state.

```ts
{
  type: 'RECONNECT',
  roomId: string;
  payload: {
    playerId: string;   // the opaque ID assigned by the server at room creation / join
  }
}
```

### `RESIGN`

Forfeit the current game.

```ts
{
  type: 'RESIGN',
  roomId: string;
  payload: {}
}
```

### `REMATCH_REQUEST`

Request a rematch (colors swap).

```ts
{
  type: 'REMATCH_REQUEST',
  roomId: string;
  payload: {}
}
```

### `REMATCH_ACCEPT` / `REMATCH_DECLINE`

```ts
{ type: 'REMATCH_ACCEPT', roomId: string; payload: {} }
{ type: 'REMATCH_DECLINE', roomId: string; payload: {} }
```

---

## Server → Client Messages

### `ROOM_CREATED`

Sent only to the creator.

```ts
{
  type: 'ROOM_CREATED',
  roomId: string;            // 6-character uppercase code, e.g. "K7XQ2A"
  payload: {
    playerId: string;        // opaque token — store in sessionStorage
    color: 'B' | 'W';
    shareUrl: string;        // deep link for the opponent
  }
}
```

### `PLAYER_JOINED`

Broadcast to both players when the room is full.

```ts
{
  type: 'PLAYER_JOINED',
  roomId: string;
  payload: {
    opponentName: string;
    opponentColor: 'B' | 'W';
    gameState: SerializedGameState;   // see below — game is now live
  }
}
```

### `GAME_STATE`

Full authoritative state after any move. Sent to both players.

```ts
{
  type: 'GAME_STATE',
  roomId: string;
  payload: {
    gameState: SerializedGameState;
    lastMove: { coordinate: [number, number]; player: 'B' | 'W' };
    seq: number;                   // echoes the client seq that triggered this
  }
}
```

### `INVALID_MOVE`

Sent only to the player who submitted an illegal move.

```ts
{
  type: 'INVALID_MOVE',
  roomId: string;
  payload: {
    coordinate: [number, number];
    reason: string;
    seq: number;
  }
}
```

### `OPPONENT_DISCONNECTED`

```ts
{
  type: 'OPPONENT_DISCONNECTED',
  roomId: string;
  payload: {
    reconnectWindowMs: number;   // how long until the game is forfeited (e.g. 30000)
  }
}
```

### `OPPONENT_RECONNECTED`

```ts
{ type: 'OPPONENT_RECONNECTED', roomId: string; payload: {} }
```

### `GAME_OVER`

```ts
{
  type: 'GAME_OVER',
  roomId: string;
  payload: {
    winner: 'B' | 'W' | null;
    reason: 'normal' | 'resign' | 'timeout' | 'forfeit';
    finalScore: { black: number; white: number };
    gameState: SerializedGameState;
  }
}
```

### `REMATCH_REQUESTED`

```ts
{ type: 'REMATCH_REQUESTED', roomId: string; payload: {} }
```

### `REMATCH_STARTED`

```ts
{
  type: 'REMATCH_STARTED',
  roomId: string;
  payload: {
    gameState: SerializedGameState;
    yourColor: 'B' | 'W';
  }
}
```

### `ERROR`

Generic error response.

```ts
{
  type: 'ERROR',
  payload: {
    code: ErrorCode;
    message: string;
  }
}

type ErrorCode =
  | 'ROOM_NOT_FOUND'
  | 'ROOM_FULL'
  | 'NOT_YOUR_TURN'
  | 'GAME_NOT_STARTED'
  | 'RECONNECT_EXPIRED'
  | 'INTERNAL_ERROR';
```

---

## SerializedGameState

This is the JSON output of `engine.exportState()` wrapped with display metadata:

```ts
interface SerializedGameState {
  // From OthelloGameEngine.exportState():
  board: TileValue[][]; // 8×8, values: 'E' | 'B' | 'W'
  moveHistory: Array<{
    player: 'B' | 'W';
    coordinate: [number, number];
    flipped: [number, number][];
    timestamp: number;
  }>;
  blackPlayerId: string;
  whitePlayerId: string;

  // Added by server:
  currentPlayer: 'B' | 'W';
  validMoves: [number, number][];
  score: { black: number; white: number };
  isGameOver: boolean;
  winner: 'B' | 'W' | null;
  timeControl?: {
    black: { remaining: number; onClock: boolean };
    white: { remaining: number; onClock: boolean };
  };
}
```

The client calls `engine.importState(JSON.stringify(serializedGameState))` to sync its local engine instance.

---

## Connection Lifecycle

```
WS connect
    │
    ├─▶ CREATE_ROOM or JOIN_ROOM or RECONNECT
    │
    │   [waiting for opponent]
    │
    ├─▶ PLAYER_JOINED  ← game begins
    │
    │   [game loop: MAKE_MOVE ↔ GAME_STATE]
    │
    ├─▶ GAME_OVER
    │
    ├─▶ optional REMATCH_REQUEST / REMATCH_ACCEPT
    │
    └─▶ WS close
```

### Reconnect Window

When a player disconnects mid-game:

1. Server keeps the room alive for `reconnectWindowMs` (recommended: 30 s).
2. Opponent sees `OPPONENT_DISCONNECTED` with a countdown.
3. If the disconnected player sends `RECONNECT` with their `playerId` within the window, `GAME_STATE` is replayed to them and `OPPONENT_RECONNECTED` is sent to the other player.
4. After the window expires, the disconnected player is forfeited (`GAME_OVER` with `reason: 'forfeit'`).

---

## Server Implementation Notes

### Engine Integration

The server maintains one `OthelloGameEngine` instance per active room:

```ts
import { OthelloGameEngine } from 'othello-engine';

const rooms = new Map<
  string,
  {
    engine: OthelloGameEngine;
    players: Map<'B' | 'W', { ws: WebSocket; id: string; name: string }>;
    reconnectTimer?: ReturnType<typeof setTimeout>;
  }
>();

// On MAKE_MOVE:
const room = rooms.get(roomId);
const success = room.engine.makeMove(payload.coordinate);
if (!success) {
  send(ws, { type: 'INVALID_MOVE', payload: { coordinate, reason: '...', seq } });
  return;
}
const state = buildSerializedState(room.engine);
broadcast(room, { type: 'GAME_STATE', payload: { gameState: state, lastMove, seq } });
```

### Room Codes

Six-character alphanumeric codes (uppercase, no ambiguous chars: 0/O, 1/I/L):

```ts
const CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const generateCode = () =>
  Array.from({ length: 6 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('');
```

### Player IDs

Use `crypto.randomUUID()` (Node 19+ / Web Crypto). Store in the client's `sessionStorage` so reconnection survives a page refresh but not a browser close.

### Security

- Validate that the connecting WebSocket's `playerId` matches the room's registered player before accepting moves.
- Rate-limit move submissions per connection (max 1 move/200 ms).
- Sanitise `playerName` to prevent XSS — max 24 chars, strip HTML.
- The server engine is the single source of truth; client-side engine is display-only after each `GAME_STATE` sync.

---

## Frontend Integration Checklist

When implementing the React client:

- [ ] `useMultiplayer` hook wraps the WebSocket and dispatches incoming messages to game state
- [ ] On `GAME_STATE`, call `engine.importState()` to sync the local engine
- [ ] Disable the board's `onPlayerTurn` callback when `currentPlayer !== yourColor`
- [ ] Show a "Waiting for opponent…" overlay between `ROOM_CREATED` and `PLAYER_JOINED`
- [ ] Show a countdown timer when `OPPONENT_DISCONNECTED` arrives
- [ ] Persist `roomId` + `playerId` to `sessionStorage` to support reconnection on refresh
- [ ] Deep-link format: `https://[host]/?room=K7XQ2A` — parse on load and auto-send `JOIN_ROOM`
