const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// In-memory state
const users = new Map(); // socketId -> user
const games = new Map(); // gameId -> game
const history = [];

// Generate server seed + hash for provably fair
function generateSeedPair() {
  const serverSeed = crypto.randomBytes(32).toString('hex');
  const serverSeedHash = crypto.createHash('sha256').update(serverSeed).digest('hex');
  return { serverSeed, serverSeedHash };
}

function getOrCreateUser(socketId, username) {
  if (!users.has(socketId)) {
    users.set(socketId, {
      id: socketId,
      username: username || `Player_${Math.floor(Math.random() * 9000 + 1000)}`,
      balance: 1000, // starting balance
      clientSeed: crypto.randomBytes(16).toString('hex')
    });
  }
  return users.get(socketId);
}

function publicGame(game) {
  return {
    id: game.id,
    creator: { id: game.creator.id, username: game.creator.username },
    joiner: game.joiner ? { id: game.joiner.id, username: game.joiner.username } : null,
    amount: game.amount,
    side: game.side, // 'heads' or 'tails' chosen by creator
    status: game.status, // waiting | flipping | finished
    result: game.result || null,
    winner: game.winner || null,
    serverSeedHash: game.serverSeedHash,
    createdAt: game.createdAt
  };
}

io.on('connection', (socket) => {
  console.log('Connected:', socket.id);

  // Join lobby
  socket.on('join', (data) => {
    const user = getOrCreateUser(socket.id, data?.username);
    socket.emit('user', user);
    socket.emit('lobby', Array.from(games.values()).map(publicGame));
    socket.emit('history', history.slice(0, 20));
    io.emit('online', users.size);
  });

  // Create coinflip
  socket.on('createGame', (data) => {
    const user = users.get(socket.id);
    if (!user) return;

    const amount = Math.floor(Number(data.amount));
    const side = data.side === 'tails' ? 'tails' : 'heads';

    if (!amount || amount < 1 || amount > user.balance) {
      socket.emit('error', 'Invalid amount or insufficient balance');
      return;
    }

    // Deduct balance immediately
    user.balance -= amount;

    const { serverSeed, serverSeedHash } = generateSeedPair();

    const game = {
      id: uuidv4(),
      creator: user,
      joiner: null,
      amount,
      side,
      status: 'waiting',
      serverSeed,
      serverSeedHash,
      createdAt: Date.now()
    };

    games.set(game.id, game);
    io.emit('gameCreated', publicGame(game));
    socket.emit('user', user);
  });

  // Join coinflip
  socket.on('joinGame', (data) => {
    const user = users.get(socket.id);
    const game = games.get(data.gameId);

    if (!user || !game) {
      socket.emit('error', 'Game not found');
      return;
    }
    if (game.status !== 'waiting') {
      socket.emit('error', 'Game already started');
      return;
    }
    if (game.creator.id === user.id) {
      socket.emit('error', 'Cannot join your own game');
      return;
    }
    if (user.balance < game.amount) {
      socket.emit('error', 'Insufficient balance');
      return;
    }

    // Deduct joiner balance
    user.balance -= game.amount;
    game.joiner = user;
    game.status = 'flipping';

    // Determine result using seeds (simple but demonstrative)
    // In real systems use more robust commit-reveal
    const combined = game.serverSeed + user.clientSeed + game.id;
    const hash = crypto.createHash('sha256').update(combined).digest('hex');
    const resultNum = parseInt(hash.slice(0, 8), 16);
    const result = resultNum % 2 === 0 ? 'heads' : 'tails';

    game.result = result;

    // Winner is the one whose side matches
    const creatorWins = result === game.side;
    game.winner = creatorWins ? game.creator : game.joiner;

    // Payout (2x - house edge optional, here 0% for demo)
    const payout = game.amount * 2;
    game.winner.balance += payout;

    // Move to history after short delay for animation
    setTimeout(() => {
      game.status = 'finished';
      history.unshift({
        id: game.id,
        amount: game.amount,
        result: game.result,
        winner: game.winner.username,
        loser: creatorWins ? game.joiner.username : game.creator.username,
        at: Date.now()
      });
      if (history.length > 50) history.pop();

      io.emit('gameFinished', {
        game: publicGame(game),
        // Reveal server seed after finish for verification
        serverSeed: game.serverSeed
      });

      // Clean up finished game from active list after a bit
      setTimeout(() => {
        games.delete(game.id);
        io.emit('gameRemoved', game.id);
      }, 8000);
    }, 3500); // time for flip animation

    io.emit('gameUpdated', publicGame(game));
    socket.emit('user', user);
    // Also update creator's client
    const creatorSocket = [...users.entries()].find(([id, u]) => u.id === game.creator.id)?.[0];
    if (creatorSocket) {
      io.to(creatorSocket).emit('user', game.creator);
    }
  });

  // Cancel own waiting game
  socket.on('cancelGame', (data) => {
    const user = users.get(socket.id);
    const game = games.get(data.gameId);
    if (!user || !game || game.creator.id !== user.id || game.status !== 'waiting') return;

    user.balance += game.amount; // refund
    games.delete(game.id);
    io.emit('gameRemoved', game.id);
    socket.emit('user', user);
  });

  // Chat
  socket.on('chat', (msg) => {
    const user = users.get(socket.id);
    if (!user || !msg || typeof msg !== 'string') return;
    const clean = msg.trim().slice(0, 200);
    if (!clean) return;
    io.emit('chat', {
      id: uuidv4(),
      username: user.username,
      message: clean,
      at: Date.now()
    });
  });

  socket.on('disconnect', () => {
    // Optional: cancel waiting games of disconnected user
    for (const [id, game] of games) {
      if (game.status === 'waiting' && game.creator.id === socket.id) {
        game.creator.balance += game.amount;
        games.delete(id);
        io.emit('gameRemoved', id);
      }
    }
    users.delete(socket.id);
    io.emit('online', users.size);
    console.log('Disconnected:', socket.id);
  });
});

app.get('/', (req, res) => {
  res.json({ status: 'Coinflip Arena API running', games: games.size, users: users.size });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
