import { useState, useCallback, useEffect } from 'react'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'
import { QueryInput } from './components/QueryInput'
import { ChunkList } from './components/ChunkList'
import { GeneratedAnswer } from './components/GeneratedAnswer'
import { Footer } from './components/Footer'
import { queryRAG, healthCheck } from './lib/api'
import type { QueryResponse, ModelInfo } from './types'

export default function App() {
  const [mode, setMode] = useState<'rag' | 'baseline_a' | 'baseline_b'>('rag')
  const [collection, setCollection] = useState('syllabus_paragraph_e5')
  const [topK, setTopK] = useState(3)
  const [model, setModel] = useState('llama-8b')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<QueryResponse | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [availableModels, setAvailableModels] = useState<ModelInfo[]>([])
  const [defaultModel, setDefaultModel] = useState('llama-8b')

  // Fetch available models on mount
  useEffect(() => {
    healthCheck()
      .then(h => {
        if (h.availableModels) {
          setAvailableModels(h.availableModels)
        }
        if (h.defaultModel) {
          setDefaultModel(h.defaultModel)
          setModel(h.defaultModel)
        }
      })
      .catch(() => {
        // Offline — use hardcoded defaults
        setAvailableModels([
          { key: 'llama-8b',  id: '@cf/meta/llama-3.1-8b-instruct-fp8',        name: 'Llama 3.1 8B',    params: '8B' },
          { key: 'llama-70b', id: '@cf/meta/llama-3.1-70b-instruct-fp8-fast',   name: 'Llama 3.1 70B',   params: '70B' },
          { key: 'llama-33',  id: '@cf/meta/llama-3.3-70b-instruct-fp8-fast',   name: 'Llama 3.3 70B',   params: '70B' },
          { key: 'mistral',   id: '@cf/mistralai/mistral-small-3.1-24b-instruct', name: 'Mistral 24B',    params: '24B' },
        ])
      })
  }, [])

  const handleQuery = useCallback(
    async (question: string, mdl?: string) => {
      setLoading(true)
      setError(null)
      setSidebarOpen(false)
      try {
        const m = mdl || model
        const data = await queryRAG({ question, mode, collection, topK, model: m })
        setResult(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Query failed')
        setResult(null)
      } finally {
        setLoading(false)
      }
    },
    [mode, collection, topK, model]
  )

  const handleModeChange = (v: string) => {
    if (v === 'rag' || v === 'baseline_a' || v === 'baseline_b') {
      setMode(v)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-dark">
      <Header />

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex gap-4 md:gap-6 p-3 md:p-6 flex-1 max-w-[1600px] mx-auto w-full">
        {/* Desktop sidebar — always visible */}
        <div className="hidden md:block shrink-0">
          <Sidebar
            mode={mode}
            setMode={handleModeChange}
            collection={collection}
            setCollection={setCollection}
            topK={topK}
            setTopK={setTopK}
            model={model}
            setModel={setModel}
            availableModels={availableModels}
            loading={loading}
          />
        </div>

        {/* Mobile sidebar — slide-over */}
        <div
          className={`fixed inset-y-0 left-0 z-40 w-72 transform transition-transform duration-200 md:hidden ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <Sidebar
            mode={mode}
            setMode={handleModeChange}
            collection={collection}
            setCollection={setCollection}
            topK={topK}
            setTopK={setTopK}
            model={model}
            setModel={setModel}
            availableModels={availableModels}
            loading={loading}
            onClose={() => setSidebarOpen(false)}
          />
        </div>

        {/* Main content */}
        <main className="flex flex-col gap-4 md:gap-6 flex-1 min-w-0">
          {/* Mobile hamburger + title bar */}
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-text-main p-2 -ml-1"
              aria-label="Open menu"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="text-sm font-semibold text-primary truncate">Sinhala RAG · COM738</span>
          </div>

          <QueryInput
            onQuery={(q, _mode, mdl) => handleQuery(q, mdl)}
            loading={loading}
            defaultModel={defaultModel}
            availableModels={availableModels}
          />

          {error && (
            <div className="bg-red-950 border border-red-700 text-red-300 px-4 md:px-5 py-3 rounded-lg text-sm font-mono">
              Error: {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
            <ChunkList chunks={result?.chunks ?? []} loading={loading} />
            <GeneratedAnswer
              answer={result?.answer ?? ''}
              mode={result?.mode ?? mode}
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
