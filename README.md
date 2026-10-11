# CoinFlip Arena

Live coinflip betting site **inspired by** BloxyBet-style lobbies (dark UI, live games, create/join, animated flips, chat, history).

This is an original implementation — not a copy of any existing site.

## Features

- Live coinflip lobby with real-time WebSocket updates
- Create / join / cancel games
- Animated 3D-style coin flip modal
- Starting balance of 1000 coins
- Simple provably-fair style seed hashing (server seed revealed after game)
- Live chat
- Recent results history
- Online player count

## Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS + Framer Motion + Socket.io-client
- **Backend**: Node.js + Express + Socket.io
- In-memory state (easy to replace with Redis / Postgres later)

## Quick Start

### 1. Backend

```bash
cd backend
npm install
npm start
```

Backend runs on `http://localhost:3001`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

Open the browser and you can create/join coinflips immediately.  
Open multiple browser tabs/windows to simulate different players.

## Notes

- Balances and games are in-memory → reset on server restart.
- No real money, no Roblox integration — pure demo.
- For production you would add proper auth, persistent DB, rate limits, and a real house edge / fairness protocol.

## License

MIT — free to modify and extend.
