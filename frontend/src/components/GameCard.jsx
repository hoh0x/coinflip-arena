import React from 'react'
import { motion } from 'framer-motion'

export default function GameCard({ game, currentUser, onJoin, onCancel }) {
  const isCreator = game.creator.id === currentUser.id
  const isWaiting = game.status === 'waiting'
  const isFlipping = game.status === 'flipping'
  const isFinished = game.status === 'finished'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`glass rounded-xl p-4 border transition ${
        isFlipping ? 'border-accent/40 animate-pulse-glow' : 'border-white/5 hover:border-white/10'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-dark-600 flex items-center justify-center text-xs font-bold text-accent">
            {game.creator.username[0]}
          </div>
          <div>
            <div className="text-sm font-medium">{game.creator.username}</div>
            <div className="text-[10px] text-gray-500 uppercase">
              calling {game.side}
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-accent font-bold font-mono text-lg">
            {game.amount.toLocaleString()}
          </div>
          <div className="text-[10px] text-gray-500">COINS</div>
        </div>
      </div>

      {game.joiner && (
        <div className="flex items-center gap-2 mb-3 text-sm text-gray-400">
          <span>vs</span>
          <div className="w-6 h-6 rounded-full bg-dark-600 flex items-center justify-center text-[10px] font-bold">
            {game.joiner.username[0]}
          </div>
          <span className="font-medium text-white">{game.joiner.username}</span>
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <div className="text-xs text-gray-500">
          {isWaiting && 'Waiting for opponent…'}
          {isFlipping && <span className="text-accent">Flipping…</span>}
          {isFinished && (
            <span className={game.winner?.id === currentUser.id ? 'text-accent' : 'text-gray-400'}>
              {game.result?.toUpperCase()} — {game.winner?.username} won
            </span>
          )}
        </div>

        <div className="flex gap-2">
          {isWaiting && isCreator && (
            <button onClick={onCancel} className="btn-secondary text-xs px-3 py-1.5">
              Cancel
            </button>
          )}
          {isWaiting && !isCreator && (
            <button onClick={onJoin} className="btn-primary text-xs px-4 py-1.5">
              Join
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
