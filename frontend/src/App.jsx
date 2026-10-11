import React, { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { motion, AnimatePresence } from 'framer-motion'
import Header from './components/Header'
import CreateGame from './components/CreateGame'
import GameCard from './components/GameCard'
import Chat from './components/Chat'
import History from './components/History'
import CoinFlipModal from './components/CoinFlipModal'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001'

export default function App() {
  const [socket, setSocket] = useState(null)
  const [user, setUser] = useState(null)
  const [games, setGames] = useState([])
  const [history, setHistory] = useState([])
  const [online, setOnline] = useState(0)
  const [chat, setChat] = useState([])
  const [activeFlip, setActiveFlip] = useState(null) // game being flipped
  const [error, setError] = useState(null)
  const [usernameInput, setUsernameInput] = useState('')

  useEffect(() => {
    const s = io(SOCKET_URL, { transports: ['websocket', 'polling'] })
    setSocket(s)

    s.on('connect', () => {
      const saved = localStorage.getItem('cfa_username')
      s.emit('join', { username: saved || undefined })
    })

    s.on('user', (u) => {
      setUser(u)
      if (u.username) localStorage.setItem('cfa_username', u.username)
    })

    s.on('lobby', (list) => setGames(list))
    s.on('history', (h) => setHistory(h))
    s.on('online', (n) => setOnline(n))

    s.on('gameCreated', (g) => {
      setGames((prev) => [g, ...prev.filter((x) => x.id !== g.id)])
    })

    s.on('gameUpdated', (g) => {
      setGames((prev) => prev.map((x) => (x.id === g.id ? g : x)))
      if (g.status === 'flipping') {
        setActiveFlip(g)
      }
    })

    s.on('gameFinished', ({ game, serverSeed }) => {
      setGames((prev) => prev.map((x) => (x.id === game.id ? { ...game, serverSeed } : x)))
      setActiveFlip((prev) => (prev?.id === game.id ? { ...game, serverSeed } : prev))
      setHistory((prev) => [
        {
          id: game.id,
          amount: game.amount,
          result: game.result,
          winner: game.winner?.username,
          at: Date.now()
        },
        ...prev
      ].slice(0, 30))
      // Update balances if we are involved
      s.emit('join', {}) // soft refresh user
    })

    s.on('gameRemoved', (id) => {
      setGames((prev) => prev.filter((x) => x.id !== id))
      setActiveFlip((prev) => (prev?.id === id ? null : prev))
    })

    s.on('chat', (msg) => {
      setChat((prev) => [...prev.slice(-80), msg])
    })

    s.on('error', (msg) => {
      setError(msg)
      setTimeout(() => setError(null), 3500)
    })

    return () => s.disconnect()
  }, [])

  const handleSetUsername = () => {
    if (!usernameInput.trim() || !socket) return
    localStorage.setItem('cfa_username', usernameInput.trim())
    socket.emit('join', { username: usernameInput.trim() })
    setUsernameInput('')
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <div className="glass p-8 rounded-2xl text-center max-w-sm w-full mx-4">
          <h1 className="text-2xl font-bold text-accent mb-2">CoinFlip Arena</h1>
          <p className="text-gray-400 mb-6 text-sm">Connecting to live lobby…</p>
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col">
      <Header user={user} online={online} />

      {error && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-red-500/90 text-white px-5 py-2 rounded-lg shadow-lg text-sm font-medium">
          {error}
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left / Main */}
        <div className="lg:col-span-8 space-y-6">
          <CreateGame
            user={user}
            onCreate={(amount, side) => socket?.emit('createGame', { amount, side })}
          />

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">
                Live Coinflips
                <span className="ml-2 text-sm font-normal text-gray-400">
                  ({games.filter((g) => g.status === 'waiting').length} open)
                </span>
              </h2>
            </div>

            {games.length === 0 ? (
              <div className="glass rounded-xl p-12 text-center text-gray-500">
                No active games. Create one to get started!
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                <AnimatePresence>
                  {games.map((game) => (
                    <GameCard
                      key={game.id}
                      game={game}
                      currentUser={user}
                      onJoin={() => socket?.emit('joinGame', { gameId: game.id })}
                      onCancel={() => socket?.emit('cancelGame', { gameId: game.id })}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </section>

          <History items={history} />
        </div>

        {/* Right sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Your Profile</h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-lg">
                {user.username?.[0]?.toUpperCase()}
              </div>
              <div>
                <div className="font-semibold">{user.username}</div>
                <div className="text-accent font-mono text-sm">{user.balance.toLocaleString()} coins</div>
              </div>
            </div>
            <div className="flex gap-2">
              <input
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Change username"
                className="flex-1 bg-dark-700 border border-white/5 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent/50"
                maxLength={16}
              />
              <button onClick={handleSetUsername} className="btn-secondary text-sm">
                Set
              </button>
            </div>
          </div>

          <Chat
            messages={chat}
            onSend={(msg) => socket?.emit('chat', msg)}
          />
        </div>
      </main>

      <AnimatePresence>
        {activeFlip && (
          <CoinFlipModal
            game={activeFlip}
            onClose={() => setActiveFlip(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
