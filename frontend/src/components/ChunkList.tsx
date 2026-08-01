import { useState } from 'react'
import type { RetrievedChunk } from '../types'

interface ChunkListProps {
  chunks: RetrievedChunk[]
  loading: boolean
}

export function ChunkList({ chunks, loading }: ChunkListProps) {
  const [open, setOpen] = useState(false)

  if (!loading && chunks.length === 0) return null

  return (
    <div className="bg-card border border-card-border rounded-xl p-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-left"
      >
        <span className="text-xs font-semibold text-text-muted uppercase tracking-wide flex items-center gap-2">
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          Retrieved Passages
          {chunks.length > 0 && (
            <span className="bg-tag-bg text-tag-text text-[10px] px-1.5 py-0.5 rounded-full font-semibold">{chunks.length}</span>
          )}
        </span>
        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className={`text-text-muted transition-transform ${open ? 'rotate-180' : ''}`}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {open && (
        <div className="mt-3 flex flex-col gap-2.5 max-h-[400px] overflow-y-auto">
          {chunks.map((chunk, i) => (
            <div key={chunk.id} className="bg-dark border border-card-border border-l-3 border-l-primary rounded-md p-3">
              <div className="flex justify-between text-[10px] text-text-muted font-mono mb-1.5">
                <span>[{i + 1}] {chunk.source} · {chunk.chunkStrategy}</span>
                <span className="text-primary font-semibold">{chunk.distance.toFixed(4)}</span>
              </div>
              <div className="text-xs leading-relaxed text-text-main">{chunk.text}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
