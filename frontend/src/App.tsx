import { useState, useCallback } from 'react'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'
import { QueryInput } from './components/QueryInput'
import { ChunkList } from './components/ChunkList'
import { GeneratedAnswer } from './components/GeneratedAnswer'
import { Footer } from './components/Footer'
import { queryRAG } from './lib/api'
import type { QueryResponse } from './types'

export default function App() {
  const [mode, setMode] = useState<'rag' | 'baseline_a' | 'baseline_b'>('rag')
  const [collection, setCollection] = useState('syllabus_paragraph_e5')
  const [topK, setTopK] = useState(3)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<QueryResponse | null>(null)

  const handleQuery = useCallback(
    async (question: string) => {
      setLoading(true)
      setError(null)
      try {
        const data = await queryRAG({ question, mode, collection, topK })
        setResult(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Query failed')
        setResult(null)
      } finally {
        setLoading(false)
      }
    },
    [mode, collection, topK]
  )

  const handleModeChange = (v: string) => {
    if (v === 'rag' || v === 'baseline_a' || v === 'baseline_b') {
      setMode(v)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-dark">
      <Header />
      <div className="flex gap-6 p-6 flex-1 max-w-[1600px] mx-auto w-full flex-wrap md:flex-nowrap">
        <Sidebar
          mode={mode}
          setMode={handleModeChange}
          collection={collection}
          setCollection={setCollection}
          topK={topK}
          setTopK={setTopK}
          loading={loading}
        />
        <main className="flex flex-col gap-6 flex-1 min-w-0">
          <QueryInput onQuery={handleQuery} loading={loading} />

          {error && (
            <div className="bg-red-950 border border-red-700 text-red-300 px-5 py-3 rounded-lg text-sm font-mono">
              Error: {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <ChunkList chunks={result?.chunks ?? []} loading={loading} />
            <GeneratedAnswer
              answer={result?.answer ?? ''}
              mode={result?.mode ?? mode}
              metrics={result?.metrics}
              latencyMs={result?.latencyMs ?? 0}
              loading={loading}
            />
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}
