import React, { useState } from 'react'

export default function CreateGame({ user, onCreate }) {
  const [amount, setAmount] = useState(50)
  const [side, setSide] = useState('heads')

  const presets = [10, 25, 50, 100, 250, 500]

  const handleCreate = () => {
    const val = Math.floor(Number(amount))
    if (val < 1 || val > user.balance) return
    onCreate(val, side)
  }

  return (
    <div className="glass rounded-xl p-5">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
        Create Coinflip
      </h2>

      <div className="flex flex-wrap gap-2 mb-4">
        {presets.map((p) => (
          <button
            key={p}
            onClick={() => setAmount(p)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              amount === p
                ? 'bg-accent text-dark-900'
                : 'bg-dark-600 hover:bg-dark-700 text-gray-300'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1">
          <label className="text-xs text-gray-500 mb-1 block">Amount</label>
          <input
            type="number"
            min={1}
            max={user.balance}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-dark-700 border border-white/5 rounded-lg px-4 py-2.5 text-lg font-mono focus:outline-none focus:border-accent/50"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">Your Side</label>
          <div className="flex rounded-lg overflow-hidden border border-white/5">
            <button
              onClick={() => setSide('heads')}
              className={`px-5 py-2.5 text-sm font-semibold transition ${
                side === 'heads' ? 'bg-accent text-dark-900' : 'bg-dark-600 text-gray-300 hover:bg-dark-700'
              }`}
            >
              HEADS
            </button>
            <button
              onClick={() => setSide('tails')}
              className={`px-5 py-2.5 text-sm font-semibold transition ${
                side === 'tails' ? 'bg-accent text-dark-900' : 'bg-dark-600 text-gray-300 hover:bg-dark-700'
              }`}
            >
              TAILS
            </button>
          </div>
        </div>

        <button
          onClick={handleCreate}
          disabled={amount < 1 || amount > user.balance}
          className="btn-primary px-8 py-2.5 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Create Game
        </button>
      </div>
    </div>
  )
}
