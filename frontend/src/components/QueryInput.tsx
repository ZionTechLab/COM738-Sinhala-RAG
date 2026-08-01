import { useState, useEffect } from 'react'
import type { ModelInfo } from '../types'

interface QueryInputProps {
  onQuery: (question: string, mode: 'rag' | 'baseline_a' | 'baseline_b', model: string) => void
  loading: boolean
  defaultModel?: string
  availableModels?: ModelInfo[]
}

const SAMPLES = [
  'ව්‍යාපාර සංවිධාන වර්ග මොනවාද?',
  'ගිණුම්කරණ සමීකරණය යනු කුමක්ද?',
  'සුළු මුදල් පොතක් පවත්වාගෙන යාමේ වාසි මොනවාද?',
  'බැංකු සැසඳීම් ප්‍රකාශනයක් පිළියෙල කරන්නේ ඇයි?',
]

export function QueryInput({ onQuery, loading, defaultModel, availableModels }: QueryInputProps) {
  const [value, setValue] = useState('')
  const [mode, setMode] = useState<'rag' | 'baseline_a' | 'baseline_b'>('rag')
  const [model, setModel] = useState(defaultModel || 'llama-8b')

  useEffect(() => {
    if (defaultModel) setModel(defaultModel)
  }, [defaultModel])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = value.trim()
    if (!q || loading) return
    onQuery(q, mode, model)
  }

  return (
    <div className="bg-card border border-card-border rounded-xl p-4 md:p-5">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {/* Question input */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder="සිංහල ප්‍රශ්නයක් අසන්න..."
            disabled={loading}
            className="flex-1 bg-dark border border-card-border text-text-main px-4 md:px-5 py-3 rounded-lg font-sinhala text-base focus:outline-none focus:border-primary disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !value.trim()}
            className="bg-primary text-white border-none px-5 py-3 rounded-lg font-semibold cursor-pointer hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap text-sm md:text-base"
          >
            {loading ? 'සොයමින්...' : 'පිළිතුර ලබාගන්න'}
          </button>
        </div>

        {/* Mode + Model selectors */}
        <div className="flex gap-3 flex-wrap items-center">
          {/* Mode selector */}
          <div className="flex gap-1 bg-dark rounded-lg p-1 border border-card-border">
            {[
              { key: 'rag', label: 'RAG' },
              { key: 'baseline_a', label: 'A: Ungrounded' },
              { key: 'baseline_b', label: 'B: Constrained' },
            ].map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setMode(key as typeof mode)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  mode === key
                    ? 'bg-primary text-white'
                    : 'text-text-muted hover:text-text-main'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Model selector */}
          {availableModels && availableModels.length > 0 && (
            <select
              value={model}
              onChange={e => setModel(e.target.value)}
              className="bg-dark border border-card-border text-text-main px-3 py-1.5 rounded-lg text-xs focus:outline-none focus:border-primary"
            >
              {availableModels.map(m => (
                <option key={m.key} value={m.key}>
                  {m.name} ({m.params})
                </option>
              ))}
            </select>
          )}
        </div>
      </form>

      {/* Sample questions */}
      <div className="flex gap-2 mt-3 flex-wrap">
        <span className="text-xs text-text-muted mr-1 self-center hidden sm:inline">නිදසුන්:</span>
        {SAMPLES.map(s => (
          <button
            key={s}
            onClick={() => { setValue(s); onQuery(s, mode, model) }}
            disabled={loading}
            className="bg-slate-800/50 border border-card-border text-text-muted px-3 py-1 rounded-full text-xs cursor-pointer hover:text-text-main hover:border-primary transition-colors disabled:opacity-50 truncate max-w-[180px] sm:max-w-none"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}
