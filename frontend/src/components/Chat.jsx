import React, { useState, useRef, useEffect } from 'react'

export default function Chat({ messages, onSend }) {
  const [text, setText] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const submit = (e) => {
    e.preventDefault()
    if (!text.trim()) return
    onSend(text.trim())
    setText('')
  }

  return (
    <div className="glass rounded-xl flex flex-col h-[420px]">
      <div className="px-4 py-3 border-b border-white/5">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Live Chat</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2 text-sm">
        {messages.length === 0 && (
          <p className="text-gray-600 text-center mt-8">No messages yet</p>
        )}
        {messages.map((m) => (
          <div key={m.id} className="leading-snug">
            <span className="font-semibold text-accent text-xs">{m.username}</span>
            <span className="text-gray-300 ml-1.5">{m.message}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={submit} className="p-3 border-t border-white/5 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Say something…"
          maxLength={200}
          className="flex-1 bg-dark-700 border border-white/5 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent/40"
        />
        <button type="submit" className="btn-primary text-sm px-4">
          Send
        </button>
      </form>
    </div>
  )
}
