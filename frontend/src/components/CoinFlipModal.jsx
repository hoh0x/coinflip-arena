import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function CoinFlipModal({ game, onClose }) {
  const [phase, setPhase] = useState('flipping') // flipping | result
  const [showSeed, setShowSeed] = useState(false)

  useEffect(() => {
    if (game.status === 'finished' || game.result) {
      const t = setTimeout(() => setPhase('result'), 2800)
      return () => clearTimeout(t)
    }
  }, [game])

  const result = game.result
  const isHeads = result === 'heads'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={phase === 'result' ? onClose : undefined}
    >
      <motion.div
        initial={{ scale: 0.85, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="glass rounded-2xl p-8 max-w-md w-full text-center border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold mb-1">
          {game.creator.username} vs {game.joiner?.username || '…'}
        </h3>
        <p className="text-gray-400 text-sm mb-8">
          {game.amount.toLocaleString()} coins · Creator called {game.side}
        </p>

        <div className="flex justify-center mb-8 perspective-[800px]">
          <div
            className={`coin ${phase === 'flipping' ? 'animate-flip' : ''}`}
            style={{
              transform:
                phase === 'result'
                  ? isHeads
                    ? 'rotateY(0deg)'
                    : 'rotateY(180deg)'
                  : undefined,
            }}
          >
            <div className="coin-face coin-heads">H</div>
            <div className="coin-face coin-tails">T</div>
          </div>
        </div>

        {phase === 'flipping' && (
          <p className="text-accent font-medium animate-pulse">Flipping…</p>
        )}

        {phase === 'result' && (
          <div>
            <div
              className={`text-3xl font-black mb-2 ${
                isHeads ? 'text-accent' : 'text-white'
              }`}
            >
              {result?.toUpperCase()}
            </div>
            <p className="text-gray-300 mb-4">
              <span className="text-accent font-semibold">{game.winner?.username}</span> wins{' '}
              {(game.amount * 2).toLocaleString()} coins!
            </p>

            {game.serverSeed && (
              <div className="text-left mt-6">
                <button
                  onClick={() => setShowSeed(!showSeed)}
                  className="text-xs text-gray-500 hover:text-accent underline"
                >
                  {showSeed ? 'Hide' : 'Show'} fairness data
                </button>
                {showSeed && (
                  <div className="mt-2 bg-dark-700 rounded-lg p-3 text-[10px] font-mono break-all text-gray-400">
                    <div className="mb-1">
                      <span className="text-gray-500">Server Seed Hash:</span>
                      <br />
                      {game.serverSeedHash}
                    </div>
                    <div>
                      <span className="text-gray-500">Server Seed (revealed):</span>
                      <br />
                      {game.serverSeed}
                    </div>
                  </div>
                )}
              </div>
            )}

            <button onClick={onClose} className="btn-primary mt-6 w-full">
              Close
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
