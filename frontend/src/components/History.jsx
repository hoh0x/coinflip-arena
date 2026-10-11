import React from 'react'

export default function History({ items }) {
  if (!items || items.length === 0) return null

  return (
    <section className="glass rounded-xl p-4">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
        Recent Results
      </h2>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {items.slice(0, 12).map((h) => (
          <div
            key={h.id + h.at}
            className="flex items-center justify-between text-sm py-1.5 border-b border-white/5 last:border-0"
          >
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  h.result === 'heads' ? 'bg-accent' : 'bg-gray-500'
                }`}
              />
              <span className="text-gray-300">
                <span className="font-medium text-white">{h.winner}</span> won
              </span>
            </div>
            <div className="font-mono text-accent text-xs">
              {h.amount?.toLocaleString()} coins
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
