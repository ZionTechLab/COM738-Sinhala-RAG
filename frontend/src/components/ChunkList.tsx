import type { RetrievedChunk } from '../types'

interface ChunkListProps {
  chunks: RetrievedChunk[]
  loading: boolean
}

export function ChunkList({ chunks, loading }: ChunkListProps) {
  return (
    <div className="bg-card border border-card-border rounded-xl p-5 flex flex-col gap-4">
      <div className="flex justify-between items-center border-b border-card-border pb-3">
        <h3 className="text-base font-semibold flex items-center gap-2">
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          ලැබුණු පෙළ කොටස්
        </h3>
        <span className="bg-tag-bg text-tag-text text-xs px-2 py-0.5 rounded-full font-semibold">
          {chunks.length > 0 ? `Top ${chunks.length}` : 'Empty'}
        </span>
      </div>

      {loading && chunks.length === 0 && (
        <div className="text-text-muted text-sm py-8 text-center animate-pulse">
          Retrieving from knowledge base...
        </div>
      )}

      {!loading && chunks.length === 0 && (
        <div className="text-text-muted text-sm py-8 text-center">
          Ask a question to see retrieved passages from the NIE O/L Business Studies syllabus.
        </div>
      )}

      {chunks.map((chunk, i) => (
        <div key={chunk.id} className="bg-dark border border-card-border border-l-4 border-l-primary rounded-md p-3.5">
          <div className="flex justify-between text-xs text-text-muted font-mono mb-2">
            <span>[{i + 1}] {chunk.source} · {chunk.chunkStrategy}</span>
            <span className="text-primary font-semibold">dist: {chunk.distance.toFixed(4)}</span>
          </div>
          <div className="text-sm leading-relaxed text-text-main">
            {chunk.text}
          </div>
        </div>
      ))}
    </div>
  )
}
