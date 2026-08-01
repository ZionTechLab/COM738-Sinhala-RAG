import { useState, useCallback, useEffect, useRef } from 'react'
import { Header } from './components/Header'
import { SplashScreen } from './components/SplashScreen'
import { LoginScreen } from './components/LoginScreen'
import { ParameterBar } from './components/ParameterBar'
import { QueryInput } from './components/QueryInput'
import { ChunkList } from './components/ChunkList'
import { GeneratedAnswer } from './components/GeneratedAnswer'
import { Footer } from './components/Footer'
import { queryRAG, healthCheck } from './lib/api'
import type { QueryResponse, ModelInfo } from './types'

export default function App() {
  // App lifecycle
  const [phase, setPhase] = useState<'splash' | 'login' | 'app'>('splash')

  // Theme
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('studymate-theme')
    return saved ? saved === 'dark' : true
  })

  // Query params
  const [mode, setMode] = useState<'rag' | 'baseline_a' | 'baseline_b'>('rag')
  const [collection, setCollection] = useState('syllabus_paragraph_e5')
  const [topK, setTopK] = useState(3)
  const [model, setModel] = useState('llama-8b')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<QueryResponse | null>(null)
  const [availableModels, setAvailableModels] = useState<ModelInfo[]>([])

  // Refs
  const modeRef = useRef(mode)
  const collectionRef = useRef(collection)
  const topKRef = useRef(topK)
  const modelRef = useRef(model)
  modeRef.current = mode
  collectionRef.current = collection
  topKRef.current = topK
  modelRef.current = model

  // Apply theme class to body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.remove('light')
    } else {
      document.body.classList.add('light')
    }
    localStorage.setItem('studymate-theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  // Fetch models after login
  useEffect(() => {
    if (phase !== 'app') return
    healthCheck()
      .then(h => {
        if (h.availableModels) setAvailableModels(h.availableModels)
        if (h.defaultModel) setModel(h.defaultModel)
      })
      .catch(() => {
        setAvailableModels([
          { key: 'llama-8b',  id: '@cf/meta/llama-3.1-8b-instruct-fp8',        name: 'Llama 3.1 8B',    params: '8B' },
          { key: 'llama-70b', id: '@cf/meta/llama-3.1-70b-instruct-fp8-fast',   name: 'Llama 3.1 70B',   params: '70B' },
          { key: 'llama-33',  id: '@cf/meta/llama-3.3-70b-instruct-fp8-fast',   name: 'Llama 3.3 70B',   params: '70B' },
          { key: 'gemini-36-flash', id: 'gemini-3.6-flash', name: 'Gemini 3.6 Flash', params: '-' },
          { key: 'gemini-35-flash', id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash', params: '-' },
          { key: 'gemini-35-lite',  id: 'gemini-3.5-flash-lite', name: 'Gemini 3.5 Lite', params: '-' },
          { key: 'gemini-31-lite',  id: 'gemini-3.1-flash-lite-preview', name: 'Gemini 3.1 Lite', params: '-' },
          { key: 'gemini-3-flash',  id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash Preview', params: '-' },
          { key: 'gemma-4',         id: 'gemma-4-31b-it', name: 'Gemma 4 31B', params: '31B' },
        ])
      })
  }, [phase])

  const handleQuery = useCallback(
    async (question: string) => {
      setLoading(true)
      setError(null)
      try {
        const data = await queryRAG({
          question,
          mode: modeRef.current,
          collection: collectionRef.current,
          topK: topKRef.current,
          model: modelRef.current,
        })
        setResult(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Query failed')
        setResult(null)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  // Splash screen
  if (phase === 'splash') {
    return <SplashScreen onDone={() => setPhase('login')} />
  }

  // Login screen
  if (phase === 'login') {
    return <LoginScreen onLogin={() => setPhase('app')} />
  }

  // Main app
  return (
    <div className="min-h-screen flex flex-col bg-dark">
      <Header darkMode={darkMode} onToggleTheme={() => setDarkMode(d => !d)} />

      <div className="flex gap-4 md:gap-6 p-3 md:p-6 flex-1 max-w-[1600px] mx-auto w-full">
        <main className="flex flex-col gap-4 md:gap-5 flex-1 min-w-0">
          {/* Parameter bar — replaces old sidebar */}
          <ParameterBar
            mode={mode} setMode={setMode}
            collection={collection} setCollection={setCollection}
            topK={topK} setTopK={setTopK}
            model={model} setModel={setModel}
            availableModels={availableModels}
            loading={loading}
          />

          <QueryInput onQuery={handleQuery} loading={loading} />

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
