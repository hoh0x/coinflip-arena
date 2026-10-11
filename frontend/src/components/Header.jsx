import React from 'react'

export default function Header({ user, online }) {
  return (
    <header className="sticky top-0 z-40 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
            <span className="text-dark-900 font-black text-lg">¢</span>
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-tight">
              CoinFlip <span className="text-accent">Arena</span>
            </h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Live Coinflips</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-2 text-sm text-gray-400">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            {online} online
          </div>
          <div className="flex items-center gap-2 bg-dark-700/80 px-3 py-1.5 rounded-lg border border-white/5">
            <span className="text-accent font-bold">{user?.balance?.toLocaleString() ?? 0}</span>
            <span className="text-gray-500 text-xs">COINS</span>
          </div>
        </div>
      </div>
    </header>
  )
}
